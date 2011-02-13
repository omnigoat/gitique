require 'spec_helper'

describe UsersController do
  render_views

  describe "main should be good" do
  	it "should be successful" do
      get 'main'
      response.should be_success
    end
  end
end