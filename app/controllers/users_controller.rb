class UsersController < ApplicationController
	def index
		@users = User.all
	end

	def new
	end

	def create
		logger.info "params: #{params.to_s}"
		@user = User.create! :username => params[:username], :email => params[:email]
		#@user.save
	end

	def show
		@user = User.find_by_username params[:username]
	end
end
