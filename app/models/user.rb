class User < ActiveRecord::Base
	attr_accessible :username, :email

	email_regex = /\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i

	validates :username, :presence   => true,
	                     :length     => { :maximum => 32 },
	                     :uniqueness => { :case_sensitive => false }
	validates :email,    :presence   => true,
	                     :format     => { :with => email_regex }
end
