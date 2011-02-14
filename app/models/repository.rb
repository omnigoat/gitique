class Repository
	include MongoMapper::Document

	key :sha1, String
	key :url, String	
end
