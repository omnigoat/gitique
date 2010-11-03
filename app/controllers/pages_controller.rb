class Array
  def shuffle
    sort_by { rand }
  end

  def shuffle!
    self.replace shuffle
  end
end

def random_file()
  #return "public/javascripts/SH/tests/theme_tests.html"
  #return "public/javascripts/SH/src/shCore.js"
  
  begin
    fhi = IO.popen("git ls-files")
    files = fhi.readlines.map {|x| x.chomp}
    return files[rand(files.length)]
    
  rescue IOError
    logger.debug "there was an error reading this stuff!"
  end
  
  return ""
end

def file_lines(filename, from, to)
  begin
    fhi = IO.popen("git show HEAD:" + filename)
    
    lines = fhi.readlines.map {|x| x.chomp}
    
    return [lines.length, lines.slice(from, to - from)]
    
  rescue IOError
    logger.debug "there was an error reading this stuff!"
  end
end

class PagesController < ApplicationController
  def random
    logger.debug "HERERE"
    IO.popen("pwd").readlines.each do |x|
      logger.debug x
    end
    
    @filename = random_file()
    @total_lines = file_lines(@filename, 0, 1)[0]
  end
  
  def load
    # logger.debug "loading: '" + params[:filename] + "': " + params[:from] + " -> " + params[:to]
    @filename = params[:filename]
    @from = Integer(params[:from])
    @to = Integer(params[:to])
    @lines = file_lines(@filename, @from, @to)[1]
    
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


















