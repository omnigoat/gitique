


class CritiquesController < ApplicationController
  def index
    @critiques = Critique.all
    respond_to do |format|
      format.html { render :nothing => true }
      format.js { render :nothing => true, :js => @critiques.to_json }
    end
  end
  
  def new
    critique = Critique.create!(params) #:username => "NYI", :commit_id => params[:commit_id], :path => params[, :lines => lines)
    
    respond_to do |format|
      format.html { render :nothing => true }
      format.js { render :nothing => true }
    end
  end
end
