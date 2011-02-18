#require 'grit'
load 'gitnative.rb'

class Array
	def random_element
		self[rand(length)]
	end
end




def dir_from_sha1(sha1)
	return "resources/repositories/" + sha1[0, 2] + "/" + sha1[2, 38]
end

def random_branch
	GitNative.branch do |thread, stdout|
		branches = stdout.readlines.map{|x| x[2..-2]}
		logger.info "BRANCHES: #{branches.to_s}"
		return branches.random_element
	end
end


def random_file(chosen_branch)
	# simply because it is a large file, we can test things better
	return "public/javascripts/notused/prototype.js"
	
	GitNative.ls_tree({:r => true}, "--name-only", chosen_branch) do |thread, stdout|
		return stdout.readlines.map{|x| x.chomp!}.random_element
	end
end


def file_lines(branch, filename, from, to)
	GitNative.cat_file({:p => true}, branch + ":" + filename) do |thread, stdout, stderr, stdin|			
		lines = stdout.readlines.map{|x| x.chomp!}
		return [lines.length, lines.slice(from, to - from)]
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

		
		GitNative.in_git_dir(dir_from_sha1(@repo.sha1)) do			
			@branch = random_branch()
			logger.info "BRANCH: #{@branch.to_s}"
		
	  	@filename = random_file(@branch)
			logger.info "FILENAME: #{@filename}"

			@total_lines = file_lines(@branch, @filename, 0, 1)[0]
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
		@from = Integer(params[:from])
		@to = Integer(params[:to])

		GitNative.in_git_dir(dir_from_sha1(repo.sha1)) do
			@lines = file_lines(@branch, @filename, @from, @to)[1]
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


















