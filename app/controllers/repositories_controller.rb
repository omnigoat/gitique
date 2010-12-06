require 'rubygems'
require 'grit'
include Grit

class RepositoriesController < ApplicationController
  def add
    #g = Repo.new('git://github.com/omnigoat/gitique.git')
    
    repo = Repository.find_by_url(params[:url])
    if repo == nil
      logger.info "adding repo '" + params[:url] + "'"
      logger.info Dir.pwd
      logger.info IO.popen("pwd").readlines
      
      repo = Repository.new(:url => params[:url])
      repo.save
      
      k = "git clone --bare " + params[:url] + " repo" + repo.id.to_s + ".git"
      logger.info "{{" + k + "}}"
      
      #Open3.popen3(k) do |stdin, stdout, stderr|
      # logger.info "STDOUT[" + stdout.readlines.join + "]"
      #logger.info "STDERR[" + stderr.readlines.join + "]"
      #end
      system k
      
      
      
      #logger.info fd.readlines.join("")
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
