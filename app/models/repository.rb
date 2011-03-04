class RepositoryBackend
	include MongoMapper::Document

	# the first commit object in the repository. this means if we
	# ever have two different commit objects with the same sha1,
	# we can differentiate between the two
	key :genesis, String, :required => true, :index => true

	many :commits
end

class Repository
	include MongoMapper::Document

	key :url, String, :required => true, :index => true
	key :sha1, String
	
	# path on disk
	def path
		#puts "url: #{@url}"
		#puts "sha1: #{@sha1}"
		return "resources/repositories/" + @sha1[0, 2] + "/" + @sha1[2, 38]
	end

	has_one :backend, :class_name => "RepositoryBackend"

	after_create :hash_url

private
	def hash_url
		@sha1 = Digest::SHA1.hexdigest(@url)
	end
end





