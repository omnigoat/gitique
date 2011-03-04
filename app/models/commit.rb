require "critique"

#======================================================================
#======================================================================
class CommitID
	attr_accessor :genesis, :sha1

	def initialize genesis, sha1
		@genesis = genesis
		@sha1 = sha1
	end

	def self.to_mongo
		return "#{genesis}--#{sha1}"
	end

	def self.from_mongo value
		/(:xdigit:+)--(:xdigit:+)/.match(value) do |m|
			@genesis = m[1]
			@sha1 = m[2]
		end
	end
end




#======================================================================
#======================================================================
class Commit
	include MongoMapper::Document

	belongs_to :repository_backend

	key :sha1, String, :index => true
	key :genesis, String, :index => true
	

	# votes upon critiques for this particular commit
	many :critique_votes

	# cached totalled votes for critiques. if a critique doesn't
	# appear in here, but it appears in its parents, it means it
	# is no longer valid
	many :cached_critiques, :class_name => "CachedCritique"
end










