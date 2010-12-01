


class CritiquesController < ApplicationController
  def get_all
    @critiques = Critique.find(:all)
    respond_to do |format|
      format.html { render :nothing => true }
      format.js { render :nothing => true, :js => @critiques.to_json }
    end
  end
  
  def add
    #render :nothing => true
    
    
    lines = params[:lines]
    logger.debug "WHOO: " + lines.class.to_s
    
    json = ActiveSupport::JSON.encode(lines)
    logger.debug json
    
    critique = Critique.new(:comments => lines.to_json)
    critique.save
    
    @critiques = Critique.find(:all).map {|x| x.to_json}
    
    respond_to do |format|
      format.html { render :nothing => true }
      format.js { render :js => @critiques.to_json }
    end
  end
end
