require 'grit'
require 'digest/sha1'
load 'gitnative.rb'
load "repotree.rb"




class RepositoriesController < ApplicationController
	def disambiguate
		if params[:add]
			self.add()
		elsif params[:remove]
			self.remove()
		else
			self.main()
		end
	end

	def add
		logger.info "GOOD-DAY!"
		render :nothing => true
		user = User.find_by_username(params[:username])
		return false if user.nil?

		logger.info "HELLO!"

		#
		# get name of repository
		#
		url = params[:url]
		repository_name = url.split("/")[-1].gsub(".git", "")


		db_repo = Repository.find_by_url(url)
		if db_repo.nil?
			logger.info "INFO: Repository was nil!"
			db_repo = Repository.create(:name => repository_name, :url => url)
		end

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
		db_repo_backend.repositories << db_repo


		#=======================================================================
		# build node graph
		#=======================================================================
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

		#puts "AFTERWARDS?"
		#=======================================================================
		# debug information
		#=======================================================================
		logger.info db_repo.commit_proxies.length
		#logger.info db_repo.heads.length

		db_repo.save!
		db_repo_backend.save!

		user.repositories << db_repo
		user.save!

	end


	def show
		@user = User.find_by_username(params[:username])
		@repository = @user.repositories.find_by_name(params[:repo_name])

		fs_repo = Grit::Repo.new @repository.path, :is_bare => true
		
		fs_branch = fs_repo.branches[0]
		
		# @commit_id = chosen_branch.commit.id

		GitNative.in_git_dir(@repository.path) do
			GitNative.ls_tree({}, fs_branch.name) do |thread, stdout|
				output_list = stdout.readlines.map{|x| x.chomp!.split(/[ \t]/)}
				@dirlist = output_list.select{|x| x[1] == "tree"}.map{|x| x[-1] + "/"}
				@filelist = output_list.select{|x| x[1] == "blob"}.map{|x| x[-1]}
			end
		end
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


	def structure
		user = User.find_by_username(params[:username])
		db_repo = user.repositories.find_by_name(params[:repo_name])

		fs_repo = Grit::Repo.new db_repo.path, :is_bare => true

		fs_branch = fs_repo.branches[0]
		filelist = {}
		GitNative.in_git_dir(db_repo.path) do
			GitNative.ls_tree({}, fs_branch.name, (params[:path] && params[:path] + "/*")) do |thread, stdout|
				stdout.readlines.map do |x|
					k = x.chomp!.split("\t")
					name = k[1]
					leaf_name = k[1].split("/")[-1]
					type = (k[0].split(" ")[1] == "tree") ? 0 : 1
					last_modified = ""
					commit_message = ""

					GitNative.log({:s => true, :reverse => true, :format => "tformat:%cr%n%s"}, "-1", name) do |thread, stdout|
						lines = stdout.readlines.map{|x|x.chomp!}
						last_modified = lines[0]
						commit_message = lines[1]
					end

					filelist[leaf_name] = {:type => type, :loaded => false, :children => {}, :last_modified => last_modified, :commit_message => commit_message}
				end
			end
		end
		
		#logger.info("#{filelist}")
		
		respond_to do |format|
			format.json { render :json => filelist }
		end
	end
end
