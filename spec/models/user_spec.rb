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


	describe "username" do
			
		it "should be present" do
			User.new(@attr.merge(:username => "")).should_not be_valid
		end
		
		it "should not be too long" do
			long_username = "a" * 51
			User.new(@attr.merge(:username => long_username)).should_not be_valid
		end

		it "should be unique" do
			# Put a user with given username address into the database.
			User.create!(@attr)
			User.new(@attr).should_not be_valid
		end

		it "should be case insensitive in its uniqueness" do
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






	describe "password" do

		it "should be present" do
			User.new(@attr.merge(:password => "", :password_confirmation => "")).
				should_not be_valid
		end

		it "should have a matching confirmation" do
			User.new(@attr.merge(:password_confirmation => "invalid")).
				should_not be_valid
		end

		it "should not be too short" do
			short = "a" * 5
			hash = @attr.merge(:password => short, :password_confirmation => short)
			User.new(hash).should_not be_valid
		end

		it "should not be too long" do
			long = "a" * 41
			hash = @attr.merge(:password => long, :password_confirmation => long)
			User.new(hash).should_not be_valid
		end
	end


	describe "password" do

		before(:each) do
			@user = User.create!(@attr)
		end

		it "should have an encrypted password attribute" do
			@user.should respond_to(:encrypted_password)
		end

		it "should set the encrypted password" do
      @user.encrypted_password.should_not be_blank
    end

   	describe "authentication" do

      it "should return nil on username/password mismatch" do
        User.authenticate(@attr[:password], "wrong password").should be_nil
      end

      it "should return nil for an username with no user" do
        User.authenticate("nonexistant user", @attr[:password]).should be_nil
      end

      it "should return the user on username/password match" do
        User.authenticate(@attr[:username], @attr[:password]).should == @user
      end
    end
	end


	
	

end