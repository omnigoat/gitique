class User < ActiveRecord::Base
	attr_accessor :password
	attr_accessible :username, :email, :password, :password_confirmation

	
	validates :username, :presence   => true,
	                     :length     => { :maximum => 32 },
	                     :uniqueness => { :case_sensitive => false }
	
	email_regex = /\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i
	validates :email,    :presence   => true,
	                     :format     => { :with => email_regex }


  validates :password, :presence     => true,
                       :confirmation => true,
                       :length       => { :within => 8..32 }
end
