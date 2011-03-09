#require 'bcrypt'

class User
	include MongoMapper::Document

	attr_accessor :password, :password_confirmation
	
	key :username, String, :required => true
	key :email, String, :required => true
	key :encrypted_password, String
	key :salt, String
	
	many :repositories

	before_save :encrypt_password, :if => :password_changed?


	#
	# username
	#
	validates_uniqueness_of :username, :case_sensitive => false
	validates_length_of :username, :within => 3..32

	#
	# email
	#
	email_regex = /\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i
	validates_length_of :email, :within => 6..100, :allow_blank => true
	validates_format_of :email, :with => email_regex, :allow_blank => true

	#
	# password
	#
	validates_presence_of :password, :if => :validate_password?
	validates_length_of :password, :within => 6..32, :if => :validate_password?
	validates_confirmation_of :password, :if => :validate_password?
	

public
	def has_password?(submitted_password)
		encrypted_password == Digest::SHA2.hexdigest(@salt + submitted_password)
	end

	def password_changed?
		!@password.blank?
	end


	def self.authenticate(username, submitted_password)
    user = find_by_username(username)
		return nil	if user.nil?
		return user if user.has_password?(submitted_password)		
	end

private
	def encrypt_password
		@salt = ActiveSupport::SecureRandom.base64(32)
		@encrypted_password = Digest::SHA2.hexdigest(@salt + @password)
	end

	def validate_password?
		return self.new? || !self.password.blank?
	end
end
