require 'rubygems'
require 'grit'

class RepositoriesController < ApplicationController
  def add
    repo = Repository.find_by_url(params[:url])
    if repo == nil
      logger.debug "ADDING REPO: " + params[:url]
      
      repo = Repository.new(:url => params[:url])
      repo.save
      
      k = "cd resources/repositories && git clone --bare " + params[:url] + " repo" + repo.id.to_s
      #logger.debug k
      IO.popen(k)
    end
    
    render :nothing => true
  end
  
  
  def remove
    render :nothing => true
    
    repo = Repository.find_by_url(params[:url])
    return if not repo
      
    k = "rm -rf resources/repositories/repo" + repo.id.to_s
    #logger.debug k
    IO.popen(k)
    
    repo.delete
  end
  
  def main
  end
end
