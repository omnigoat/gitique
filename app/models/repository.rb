require "Grit"
require "RepoTree"

class RepositoryBackend
	include MongoMapper::Document

	# the first commit object in the repository. this means if we
	# ever have two different commit objects with the same sha1,
	# we can differentiate between the two
	key :genesis, String, :required => true, :index => true

	many :repositories
	many :commits
end

class CommitProxy
	include MongoMapper::Document
	belongs_to :repository
	
	key :sha1, String
	key :children, Set, :typecast => "CommitProxy"
	key :parents, Set, :typecast => "CommitProxy"

	one :commit, :class_name => "Commit"
end

class Repository
	include MongoMapper::Document

	key :name, String
	key :url, String, :required => true, :index => true
	key :sha1, String
		
	many :heads, :class_name => "CommitProxy"
	#one  :root, :class_name => "CommitProxy"
	many :commit_proxies, :class_name => "CommitProxy"

	# path on disk
	def path
		#puts "url: #{@url}"
		#puts "sha1: #{@sha1}"
		return "resources/repositories/" + @sha1[0, 2] + "/" + @sha1[2, 38]
	end

	#has_one :backend, :class_name => "RepositoryBackend"
	belongs_to :backend, :class_name => "RepositoryBackend"

	after_create :hash_url

	#======================================================================
	# builds the tree, creating commit entries in our database if needed
	#======================================================================
	def build_tree
		fs_repo, commit_nodes = build_repo_tree()

		built_proxies = {}

		for_each_ref do |node|
			# if the commit document doesn't exist - that's fine. it is totally
			# allowable for a new branch or entire repo to be created here
			corresponding_db_commit = Commit.find_or_create_by_genesis_and_sha1(backend.genesis, node.id)

			# creating new proxy object
			proxy = CommitProxy.new(:sha1 => node.id, :commit => corresponding_db_commit)
			built_proxies[node.id] = proxy

			# set parents/children
			node.parents.each do |parent|
				proxy.parents << parent.id
				built_proxies[parent.id].children << proxy
			end
		end

		fs_repo.heads.each do |head|
			heads << built_proxies[head.commit.id]
		end

		built_proxies.each_value do |v|
			commit_proxies << v
		end
		
	end


	#======================================================================
	# does something for each commit
	#======================================================================
	def for_each_ref &block
		fs_repo, commit_nodes = build_repo_tree()

		root = commit_nodes[backend.genesis]
		RepoTree::for_each root, do |node|
			node.remaining_parents = node.parents.clone
		end

		def for_each_impl commit, &block
			until commit.nil?
				return unless commit.remaining_parents.empty?

				commit.children.each {|x| x.remaining_parents.delete commit}

				yield commit 

				if commit.children.length == 1
					commit = commit.children.to_a[0]
				else
					puts "splitting"
					commit.children.each do |child|
						for_each_impl child, &block
					end
					commit = nil
				end
			end
		end

		return for_each_impl(root, &block)
	end

private
		

	#======================================================================
	# builds a tree by quereying the repository information
	#  - returns the grit repository object and a lookup-table of nodes
	#======================================================================
	def build_repo_tree
		fs_repo = Grit::Repo.new path, :is_bare => true

		commit_nodes = {}
		fs_repo.branches.each do |branch|
			RepoTree::build_commit_tree commit_nodes, branch.commit
		end

		return fs_repo, commit_nodes
	end

private
	def hash_url
		@sha1 = Digest::SHA1.hexdigest(@url)
	end
end





