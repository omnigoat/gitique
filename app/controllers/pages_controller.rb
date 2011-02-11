require 'grit'
include Grit


class Array
	def shuffle
		sort_by { rand }
	end

	def shuffle!
		self.replace shuffle
	end
end

def dir_from_sha1(sha1)
	return sha1[0, 2] + "/" + sha1[2, 38]
end

def git(repo_dir, string)
	#dir = "resources/repositories/#{dir_from_sha1(repo.sha1)}"
	command = "git --git-dir=resources/repositories/#{repo_dir} #{string}"

	#logger.info "command: #{command}"
	begin
    result = ""
    Open3.popen3(command) do |stdin, stdout, stderr|
  		result = stdout.readlines
      logger.error stderr.readlines.join
		end
    
    return result

	rescue IOError
		logger.debug "ERROR WHILST: " + command
	end
end

def random_branch(repo_dir)
	branches = git(repo_dir, "branch").map {|x| x[2..-2]}
	logger.info "BRANCHES: #{branches.to_s}"
	chosen_branch = branches[rand(branches.size)]
	

	return chosen_branch
end


def random_file(repo_dir, chosen_branch)
	return "public/javascripts/notused/prototype.js"
	
	files = git(repo_dir, "ls-tree -r --name-only " + chosen_branch).map {|x| x.chomp!}
	chosen_file = files[rand(files.size)]
	#logger.debug "TREE: " + files.to_s
end


def file_lines(repo_dir, branch, filename, from, to)
	begin
		lines = git(repo_dir, "cat-file -p " + branch + ":" + filename).map {|x| x.chomp!}
		return [lines.length, lines.slice(from, to - from)]
		
	rescue IOError
		logger.debug "there was an error reading this stuff!"
	end
end

class PagesController < ApplicationController
	def random
		
    @repo = Repository.random()
		repo_dir = dir_from_sha1(@repo.sha1)
		

		@branch = random_branch(repo_dir)
		logger.info "BRANCH: #{@branch.to_s}"
	
  	@filename = random_file(repo_dir, @branch)
		logger.info "FILENAME: #{@filename}"

		@total_lines = file_lines(repo_dir, @branch, @filename, 0, 1)[0]
	end
	
	
	
	def load
		# logger.debug "loading: '" + params[:filename] + "': " + params[:from] + " -> " + params[:to]
		repo = Repository.find_by_id(params[:repo_id])
		@repo = repo
		@branch = params[:branch]
		@filename = params[:filename]
		@from = Integer(params[:from])
		@to = Integer(params[:to])
		@lines = file_lines(dir_from_sha1(repo.sha1), @branch, @filename, @from, @to)[1]
		
		respond_to do |format|
			format.html { render "load", :layout => false }
		end
	end
	
	def post
		# logger.debug "WHOOOO!: " + params[:comments]
		
		critique = Critique.new(:comments => params[:comments])
		critique.save
		
		@critiques = Critique.find(:all)
		
		render :layout => false
	end
	
end


















