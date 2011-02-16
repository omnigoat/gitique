require 'grit'
require 'digest/sha1'

#include Grit


class RepositoriesController < ApplicationController
	def add
		render :nothing => true

		url = params[:url]

		repo = Repository.find_by_url(url)
		#if !repo.nil?
		#	logger.info "can't add repo " + repo.sha1 + " - it already exists!"
		#	return
		#end
		
		sha1 = Digest::SHA1.hexdigest(url)
		git_dir = sha1[0,2] + "/" + sha1[2, 38]
		full_git_dir = "resources/repositories/" + git_dir
		#fs_repo = Grit::Repo.new git_dir, :is_base => true

		

		# clone git repository, and if we succeed, then store that into our database
		logger.info "cloning repository '#{url}' to '#{git_dir}'"
		gritty = Grit::Git.new git_dir
		
		Open3.popen3("git clone --bare #{url} resources/repositories/#{dir}") do |stdin, stdout, stderr, thread|
			logger.info stderr.readlines.join

			if thread.value == 0
				repo = Repository.new(:sha1 => sha1, :url => url)
				repo.save
			end
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
