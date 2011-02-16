class Repository
	include MongoMapper::Document

	key :sha1, String, :index => true
	key :url, String

	key :base_commit, String, :index => true
end
