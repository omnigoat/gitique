class PagesController < ApplicationController
  def random
    fhi = IO.popen("cd ~/rails_projects/gitique && git show HEAD:Gemfile") #public/javascripts/prototype.js")

    begin
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
