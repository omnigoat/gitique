class Array
  def shuffle
    sort_by { rand }
  end

  def shuffle!
    self.replace shuffle
  end
end


class PagesController < ApplicationController
  def random

    #
    # getting a list of files
    #
    begin
      fhi = IO.popen("cd ~/rails_projects/gitique && git ls-files")
      
      lines = fhi.readlines
      @files = lines.map {|x| x.chomp!}
      @thing = @files.shuffle![0]
      
    rescue IOError
      logger.debug "there was an error reading this stuff!"
    end
    
    begin
      fhi = IO.popen("cd ~/rails_projects/gitique && git show HEAD:" + @thing) #public/javascripts/prototype.js")
      
      lines = fhi.readlines
      lines.each do |x|
        x.chomp!
      end

      @text = (1 .. lines.size).zip lines
    rescue IOError
      logger.debug "there was an error reading this stuff!"
    end
    
  end
end
