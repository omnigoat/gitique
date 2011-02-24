class Repository
	include MongoMapper::Document

	key :sha1, String, :index => true
	key :url, String

	# the first commit object in the repository. this means if we
	# ever have two different commit objects with the same sha1,
	# we can differentiate between the two
	key :genesis, String

end
