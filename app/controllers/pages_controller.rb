class Array
  def shuffle
    sort_by { rand }
  end

  def shuffle!
    self.replace shuffle
  end
end

def git_do(repo, string)
  command = "cd resources/repositories/repo" + repo.id.to_s + " && " + string
  begin
    return IO.popen(command)
  rescue IOError
    logger.debug "ERROR WHILST: " + command
  end
end

def random_branch(repo)
  branches = git_do(repo, "git branch").map {|x| x[2..-2]}
  chosen_branch = branches[rand(branches.size)]
  #logger.debug "YOYO: " + branches.to_s

  return chosen_branch
end


def random_file(repo, chosen_branch)
  #return "public/javascripts/SH/tests/theme_tests.html"
  #return "public/javascripts/SH/src/shCore.js"
  
  files = git_do(repo, "git ls-tree -r --name-only " + chosen_branch).map {|x| x.chomp!}
  chosen_file = files[rand(files.size)]
  #logger.debug "TREE: " + files.to_s
end


def file_lines(repo, branch, filename, from, to)
  begin
    lines = git_do(repo, "git cat-file -p " + branch + ":" + filename).map {|x| x.chomp!}
    return [lines.length, lines.slice(from, to - from)]
    
  rescue IOError
    logger.debug "there was an error reading this stuff!"
    
  end
end

class PagesController < ApplicationController
  def random
    @repo = Repository.random()
    #logger.debug "REPO.ID: " + repo.id.to_s
  
    @branch = random_branch(@repo)
    @filename = random_file(@repo, @branch)
    #logger.debug "RANDOM: " + @filename
    
    @total_lines = file_lines(@repo, @branch, @filename, 0, 1)[0]
    #@repo_id = repo.id.to_s
  end
  
  
  
  def load
    # logger.debug "loading: '" + params[:filename] + "': " + params[:from] + " -> " + params[:to]
    repo = Repository.find_by_id(params[:repo_id])
    @repo = repo
    @branch = params[:branch]
    @filename = params[:filename]
    @from = Integer(params[:from])
    @to = Integer(params[:to])
    @lines = file_lines(repo, @branch, @filename, @from, @to)[1]
    
    render :layout => false
  end
  
  def post
    # logger.debug "WHOOOO!: " + params[:comments]
    
    critique = Critique.new(:comments => params[:comments])
    critique.save
    
    @critiques = Critique.find(:all)
    
    render :layout => false
  end
  
end


















