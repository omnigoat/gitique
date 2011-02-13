require 'spec_helper'

describe User do
	before(:each) do
		@attr = {
			:username => "Example User",
			:email => "user@example.com",
			:password => "foobarbaz",
			:password_confirmation => "foobarbaz"
		}
	end

	#
	# validity
	#
	it "should create a new instance given valid attributes" do
		User.create!(@attr)
	end


	describe "username validation" do
			
		it "should require a username" do
			User.new(@attr.merge(:username => "")).should_not be_valid
		end
		
		it "should reject usernames that are too long" do
			long_username = "a" * 51
			User.new(@attr.merge(:username => long_username)).should_not be_valid
		end

		it "should reject duplicate usernames" do
			# Put a user with given username address into the database.
			User.create!(@attr)
			User.new(@attr).should_not be_valid
		end

		it "should reject usernames identical up to case" do
			upcased_username = @attr[:username].upcase
			User.create!(@attr.merge(:username => upcased_username))
			User.new(@attr).should_not be_valid
		end
	end

	describe "email validation" do

		it "should require an email address" do
			User.new(@attr.merge(:email => "")).should_not be_valid
		end

		it "should accept valid email addresses" do
			addresses = %w[user@foo.com THE_USER@foo.bar.org first.last@foo.jp]
			addresses.each do |address|
				User.new(@attr.merge(:email => address)).should be_valid
			end
		end

		it "should reject invalid email addresses" do
			addresses = %w[user@foo,com user_at_foo.org example.user@foo.]
			addresses.each do |address|
				User.new(@attr.merge(:email => address)).should_not be_valid
			end
		end
	end






	describe "password validations" do

		it "should require a password" do
			User.new(@attr.merge(:password => "", :password_confirmation => "")).
				should_not be_valid
		end

		it "should require a matching password confirmation" do
			User.new(@attr.merge(:password_confirmation => "invalid")).
				should_not be_valid
		end

		it "should reject short passwords" do
			short = "a" * 5
			hash = @attr.merge(:password => short, :password_confirmation => short)
			User.new(hash).should_not be_valid
		end

		it "should reject long passwords" do
			long = "a" * 41
			hash = @attr.merge(:password => long, :password_confirmation => long)
			User.new(hash).should_not be_valid
		end
	end


	describe "password encryption" do

		before(:each) do
			@user = User.create!(@attr)
		end

		it "should have an encrypted password attribute" do
			@user.should respond_to(:encrypted_password)
		end

		it "should set the encrypted password" do
      @user.encrypted_password.should_not be_blank
    end

    describe "has_password? method" do

      it "should be true if the passwords match" do
        @user.has_password?(@attr[:password]).should be_true
      end    

      it "should be false if the passwords don't match" do
        @user.has_password?("invalid").should be_false
      end 
    end
	end


	
	

end