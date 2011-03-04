load 'gitnative.rb'
load 'repotree.rb'

class Array
	def random_element
		self[rand(length)]
	end
end




def dir_from_sha1(sha1)
	return "resources/repositories/" + sha1[0, 2] + "/" + sha1[2, 38]
end



def random_file(chosen_branch)
	# simply because it is a large file, we can test things better
	return "public/javascripts/notused/prototype.js"
	
	GitNative.ls_tree({:r => true}, "--name-only", chosen_branch) do |thread, stdout|
		return stdout.readlines.map{|x| x.chomp!}.random_element
	end
end

def file_lines(branch, filename)
	GitNative.cat_file({:p => true}, branch + ":" + filename) do |thread, stdout, stderr, stdin|			
		lines = stdout.readlines.map{|x| x.chomp!}
		return [lines.length, lines]
	end
end







class PagesController < ApplicationController
	#=======================================================================
	#
	# RANDOM
	#
	#=======================================================================
	def random
		
		# SERIOUSLY, terribly inefficient with lots of repositories
    @repo = Repository.all[0]
    if @repo == nil
    	logger.error "BAD REPO"
    	return false
    end

		dir = dir_from_sha1(@repo.sha1)

		repo = Grit::Repo.new dir, :is_bare => true
		
		chosen_branch = repo.branches.random_element
		#logger.info .commit.id
		@commit_id = chosen_branch.commit.id

		GitNative.in_git_dir(dir) do			
			@branch = chosen_branch.name
			logger.info "BRANCH: #{@branch}"
			#logger.info "TREE: " + chosen_branch.commit.tree
			logger.info "TREE.CONTENTS: #{chosen_branch.commit.tree.contents}"

	  	@filename = random_file(@branch)
			logger.info "FILENAME: #{@filename}"
		end
	end
	
	
	#=======================================================================
	#
	# LOAD
	#
	#=======================================================================
	def load
		repo = Repository.find_by_sha1(params[:repo_sha1])

		@repo = repo
		@branch = params[:branch]
		@filename = params[:filename]

		GitNative.in_git_dir(dir_from_sha1(repo.sha1)) do
			@lines = file_lines(@branch, @filename)[1]
		end
		
		respond_to do |format|
			format.html { render "load", :layout => false }
		end
	end
	


	#=======================================================================
	#
	# POST
	#
	#=======================================================================
	def post
		# logger.debug "WHOOOO!: " + params[:comments]
		
		critique = Critique.new(:comments => params[:comments])
		critique.save
		
		@critiques = Critique.find(:all)
		
		render :layout => false
	end
	
end


















