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


  before_save :encrypt_password



	def has_password?(submitted_password)
    encrypted_password == encrypt(submitted_password)
	end
	
	def self.authenticate(username, submitted_password)
    user = find_by_username(username)
    return nil  if user.nil?
    return user if user.has_password?(submitted_password)
  end

  private
    def encrypt_password
      self.salt = make_salt if new_record?
      self.encrypted_password = encrypt(password)
    end

    def encrypt(string)
      secure_hash("#{salt}--#{string}")
    end

    def make_salt
      secure_hash("#{Time.now.utc}--#{password}")
    end

    def secure_hash(string)
      Digest::SHA2.hexdigest(string)
    end

    
end
