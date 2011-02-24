require 'grit'
require 'digest/sha1'
require 'gitnative'





class CommitNode
	@children = []

	attr :id
	attr_accessor :children, :parents, :visited_parents
	

	def initialize id
		@id = id
		@children = Set.new
		@parents = Set.new
		@visited_parents = Set.new
	end
end


class RepositoriesController < ApplicationController
	def add
		render :nothing => true

		url = params[:url]

		repo = Repository.find_by_url(url)
		#if !repo.nil?
		#	logger.info "ERROR:  can't add repo " + repo.sha1 + " - it already exists!"
		#	return false
		#end
		
		sha1 = Digest::SHA1.hexdigest(url)
		git_dir = sha1[0,2] + "/" + sha1[2, 38]
		full_git_dir = "resources/repositories/" + git_dir
		
		# clone git repository
		logger.info "cloning repository '#{url}' to '#{git_dir}'"
		GitNative.clone({:bare => true}, url, full_git_dir) do |thread, stdout, stderr, stdin|
			stderr.readlines.each {|x| puts "ERROR:  #{x}"}
			#return false if thread.value != 0
		end

		#
		# GET REPOSITORY
		#
		fs_repo = Grit::Repo.new full_git_dir, :is_bare => true
		
		#
		# GENESIS
		#
		genesis = ""
		GitNative.in_git_dir(full_git_dir) do
			GitNative.log({:pretty => "format:%H"}, "| tail -1") do |thread, stdout|
				return false unless thread.value == 0
				genesis = stdout.readline
			end
		end
		
		#=======================================================================
		# build node graph
		#=======================================================================
		commit_nodes = {}
		fs_repo.branches.each do |branch|
			build_commit_tree branch.commit, commit_nodes
		end
		
		#=======================================================================
		# propagate critiques
		#=======================================================================
		root = commit_nodes[genesis]

		for_each root, do |node|
			db_commit = Commit.find(:genesis => genesis, :sha1 => node.id)
			merged_critiques = {}
			
			node.parents.each do |parent|
				db_parent =  Commit.find_or_create_by_genesis_and_sha1(genesis, parent.id)

				db_parent.cached_critiques.each do |cc|
					mc = merged_critiques[cc.critique._id] ||= {
						:critique => cc.critique,
						:votes_up => 0,
						:votes_down => 0
					}

					mc[:votes_up] += cc.votes_up
					mc[:votes_down] += cc.votes_down
				end
			end

			merged_critiques.each do |key, mc|
				if mc.votes_up / mc.votes_down > 5
					db_commit.cached_critiques << CachedCritique.build(mc)
				end
			end
		end


	end


	def for_each node, options = {}, &block
		options = {:after_all_parents => true}.merge(options)

		def for_each_impl options, node, parent, &block
			if options[:after_all_parents]
				# throw if the parent is good but not present in the child's visited-parent list
				throw if not parent.nil? and node.visited_parents.delete(parent).nil?
				if node.visited_parents.empty?
					yield node
				else
					return
				end
			else
				yield node
			end

			node.children.each do |child|
				for_each_impl options, child, node, &block
			end
		end

		if options[:after_all_parents]
			def build_history node
				node.visited_parents = node.parents.dup
				node.children.each do |child|
					build_history child
				end
			end

			build_history node
		end

		for_each_impl options, node, nil, &block
	end


	def propagate_critiques genesis, node, db_commit = nil
		# limit db pulls
		if db_commit.nil?
			db_commit = Commit.find(:genesis => genesis, :sha1 => node.id) or Commit.new(:genesis => genesis, :sha1 => node.id)
		end


		node.children.each do |child|
			db_child = Commit.find(:genesis => genesis, :sha1 => child.id) or Commit.new(:genesis => genesis, :sha1 => child.id)
			
			db_commit.cached_critiques.each do |cc|
				child_cc = db_child.cached_critiques.find(:username => cc.username, :direction => cc.dirction, :critique => cc.critique)


				if cc.votes_up / cc.votes_down > 5

					db_child.cached_critiques << CachedCritique.build(:username => cc.username, :direction => cc.dirction, :critique => cc.critique)
				end


			end
		end
	end









	#=======================================================================
	#=======================================================================
	def build_commit_tree commit, commit_nodes
		def associate commit, parent, commit_nodes
			parent_node = commit_nodes[parent.id] ||= CommitNode.new(parent.id)
			child_node = commit_nodes[commit.id]
			throw if child_node.nil?

			parent_node.children.add? child_node
			child_node.parents.add? parent_node
		end

		until commit.nil?
			commit_nodes[commit.id] ||= CommitNode.new(commit.id)
			
			if commit.parents.length == 1
				associate commit, commit.parents[0], commit_nodes
				commit = commit.parents[0]
			else
				commit.parents.each do |parent|
					associate commit, parent, commit_nodes
					build_commit_tree parent, commit_nodes
				end
				commit = nil
			end
		end
	end


	#=======================================================================
	#=======================================================================
	def print_commit_tree commit, spaces, siblings = 0
		return false if commit.nil?

		if siblings > 0
			puts ":" + (" " * (spaces - 1)) + "*" + commit.id
		else
			puts ":" + (" " * spaces) + commit.id
		end
	
		commit.children.each do |child|
			print_commit_tree child, spaces + (commit.children.length > 1 ? 1 : 0), commit.children.length - 1
		end
	end

	
	def remove
		render :nothing => true
		
		sha1 = Digest::SHA1.hexdigest(params[:url])
		repo = Repository.find_by_sha1(sha1)
		return if not repo
		
		dir = sha1[0,2] + "/" + sha1[2, 38]

		logger.info "Removing repository #{dir}"
		IO.popen("rm -rf resources/repositories/#{dir}")
		repo.delete
	end
	


	def main
		@repositories = Repository.all
	end
end
