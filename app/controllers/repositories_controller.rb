require 'rubygems'
require 'grit'

class RepositoriesController < ApplicationController
  def add
    repo = Repository.find_by_url(params[:url])
    if repo == nil
      logger.info  "adding repo " + params[:url]
      
      repo = Repository.new(:url => params[:url])
      repo.save
      
      k = "cd resources/repositories && git clone --bare " + params[:url] + " repo" + repo.id.to_s
      logger.info "{{" + k + "}}"
      logger.info IO.popen(k)
    else
      logger.info "can't add repo" + repo.id.to_s + " - it already exists!"
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
