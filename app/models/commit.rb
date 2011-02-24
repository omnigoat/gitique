

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
		/(xdigit:+)--(:xdigit:+)/.match(value) do |m|
			@genesis = m[1]
			@sha1 = m[2]
		end
	end
end




#======================================================================
#======================================================================
class CritiqueVote
	include MongoMapper::EmbeddedDocument
	belongs_to :commit

	key :username, String
	key :direction, Integer

	one :critique
end


#======================================================================
# this has all historical information precalculated so we do not need
# to traverse its ancestry every pageview
#======================================================================
class CachedCritique
	include MongoMapper::EmbeddedDocument
	belongs_to :commit

	key :votes_up, Integer
	key :votes_down, Integer

	one :critique, :class => Critique
end

#======================================================================
#======================================================================
class Commit
	include MongoMapper::Document

	key :sha1, String, :index => true
	key :genesis, String, :index => true
	

	# votes upon critiques for this particular commit
	many :critique_votes

	# cached totalled votes for critiques. if a critique doesn't
	# appear in here, but it appears in its parents, it means it
	# is no longer valid
	many :cached_critiques, :class => CachedCritique
end










class Critique
	include MongoMapper::Document

	key :username, String, :index => true
	key :commit_id, ObjectId, :index => true
	key :path, String, :index => true

	# an array of arrays of integers, signifying the lines in question
	key :lines, Array
	# what was actually said
	key :remarks, String

	many :cached_critiques, :class => CachedCritique
	many :critique_votes, :class => CritiqueVote
end
