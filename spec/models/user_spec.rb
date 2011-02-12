require 'spec_helper'

describe User do
  before(:each) do
    @attr = { :username => "Example User", :email => "user@example.com" }
  end

  #
  # validity
  #
  it "should create a new instance given valid attributes" do
    User.create!(@attr)
  end


  #
  # :username
  #
  it "should require a username" do
  	no_username_user = User.new(@attr.merge(:username => ""))
    no_username_user.should_not be_valid
  end
	
	it "should reject usernames that are too long" do
    long_username = "a" * 51
    long_username_user = User.new(@attr.merge(:username => long_username))
    long_username_user.should_not be_valid
  end

  it "should reject duplicate usernames" do
    # Put a user with given username address into the database.
    User.create!(@attr)
    user_with_duplicate_username = User.new(@attr)
    user_with_duplicate_username.should_not be_valid
  end

  it "should reject usernames identical up to case" do
    upcased_username = @attr[:username].upcase
    User.create!(@attr.merge(:username => upcased_username))
    user_with_duplicate_username = User.new(@attr)
    user_with_duplicate_username.should_not be_valid
  end


  #
  # :email
  #
	it "should require an email address" do
    no_email_user = User.new(@attr.merge(:email => ""))
    no_email_user.should_not be_valid
  end

  it "should accept valid email addresses" do
    addresses = %w[user@foo.com THE_USER@foo.bar.org first.last@foo.jp]
    addresses.each do |address|
      valid_email_user = User.new(@attr.merge(:email => address))
      valid_email_user.should be_valid
    end
  end

  it "should reject invalid email addresses" do
    addresses = %w[user@foo,com user_at_foo.org example.user@foo.]
    addresses.each do |address|
      invalid_email_user = User.new(@attr.merge(:email => address))
      invalid_email_user.should_not be_valid
    end
  end

end