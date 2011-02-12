class UsersController < ApplicationController
	def main
		@k = User.new(:username => "hooray!", :email => "thing@thing.com")
	end
end
