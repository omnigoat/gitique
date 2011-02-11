require 'grit'
require 'digest/sha1'

include Grit


class RepositoriesController < ApplicationController
	def add
		url = params[:url]

		repo = Repository.find_by_url(url)
		if repo == nil
			
			sha1 = Digest::SHA1.hexdigest(url)
			dir = sha1[0,2] + "/" + sha1[2, 38] + ".git"

			# clone git repository, and if we succeed, then store that into our database
			logger.info "Cloning repository '#{url}' to '#{dir}'"
			Open3.popen3("git clone --bare #{url} resources/repositories/#{dir}") do |stdin, stdout, stderr, thread|
				logger.info stderr.readlines.join

				if thread.value == 0
					repo = Repository.new(:url => url)
					repo.save
				end
			end
			
		else
			logger.info "can't add repo" + repo.id.to_s + " - it already exists!"
			
		end
		
		render :nothing => true
	end
	
	
	def remove
		render :nothing => true
		
		repo = Repository.find_by_url(params[:url])
		return if not repo
		
		sha1 = Digest::SHA1.hexdigest(url)
		dir = sha1[0,2] + "/" + sha1[2, 38] + ".git"

		k = "rm -rf resources/repositories/#{dir}"
		logger.info k
		IO.popen(k)
		repo.delete
	end
	
	def main
		@repositories = Repository.all
	end
end
