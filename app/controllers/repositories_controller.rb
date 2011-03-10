require 'grit'
require 'digest/sha1'
require 'gitnative'
load "repotree.rb"




class RepositoriesController < ApplicationController
	def disambiguate
		case params[:name]
		when :add
			self.add()
		when :remove
			self.remove()
		else
			self.main()
			render :main
		end
	end

	def add
		render :main

		user = User.find_by_username(params[:username])
		return false if user.nil?



		url = params[:url]
		db_repo = Repository.find_or_create_by_url(url)


		#
		# clone git repository
		#
		GitNative.clone({:bare => true}, url, db_repo.path) do |thread, stdout, stderr, stdin|
			stderr.readlines.each {|x| puts "ERROR:  #{x}"}
		end


		#
		# get repository
		#
		fs_repo = Grit::Repo.new db_repo.path, :is_bare => true

		 
		#
		# get genesis
		#
		genesis = nil
		GitNative.in_git_dir(db_repo.path) do
			GitNative.log({:pretty => "format:%H"}, "| tail -1") do |thread, stdout|
				return false unless thread.value == 0
				genesis = stdout.readline
			end
		end
		
		#
		# find/create backend-repo and link it
		#
		db_repo_backend = RepositoryBackend.find_by_genesis(genesis)
		if db_repo_backend.nil?
			puts "BACKEND WAS NIL"
			db_repo_backend = RepositoryBackend.create(:genesis => genesis)
		end

		throw "bad repo/backend" if db_repo.nil? or db_repo_backend.nil?
		db_repo.backend = db_repo_backend
		db_repo.save!

		#=======================================================================
		# build node graph
		#=======================================================================
		#commit_nodes = {}
		#fs_repo.branches.each do |branch|
		#	RepoTree::build_commit_tree commit_nodes, branch.commit
		#end
		db_repo.build_tree
		
		#=======================================================================
		# propagate critiques
		#=======================================================================
		db_repo.for_each_ref do |node|

			db_commit = Commit.find_or_create_by_genesis_and_sha1(genesis, node.id)
			db_commit.repository_backend = db_repo_backend
			db_repo_backend.commits << db_commit
			merged_critiques = {}
			
			node.parents.each do |parent|
				db_parent = Commit.find_by_genesis_and_sha1(genesis, parent.id)
				throw if db_parent.nil?

				db_parent.cached_critiques.each do |cc|
					
					next if db_commit.cached_critiques.find{|x| x.critique == cc.critique}

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

		puts "AFTERWARDS?"
		puts db_repo.commit_proxies.length
		puts db_repo.heads.length

		db_repo.save!
		db_repo_backend.save!

		user.repositories << db_repo
		user.save!

	end








	
	def remove
		render "main"
		logger.info "KKKKK #{params}"

		sha1 = Digest::SHA1.hexdigest(params[:url])
		repo = Repository.find_by_sha1(sha1)
		return if not repo
		
		dir = sha1[0,2] + "/" + sha1[2, 38]

		logger.info "Removing repository #{dir}"
		IO.popen("rm -rf resources/repositories/#{dir}")
		repo.delete
	end
	
	def remove_db
		Repository.delete_all
		RepositoryBackend.delete_all
		CommitProxy.delete_all

		render :nothing => true
	end

	def main
		@repositories = Repository.all
		@repo_backends = RepositoryBackend.all
"""
		@repos = Repository.all.map do |x|
			return OpenStruct.new({
				:sha1 => x.sha1,
				:url => x.url,
				:proxies => x.for_each_ref({:spaces => 0, :siblings => 0, :flattened_nodes => []}) do |node, data|
					data[:flattened_nodes] << (" " * data[:spaces] + node.id)
					if 
				end
			})
		end
"""



	end
end
