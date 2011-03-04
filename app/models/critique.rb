
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

	one :critique, :class_name => "Critique"
end


class Critique
	include MongoMapper::Document

	key :username, String, :index => true
	#key :commit_id, ObjectId, :index => true
	key :filepath, String, :index => true

	# an array of arrays of integers, signifying the lines in question
	key :lines, Array
	# what was actually said
	key :remarks, String

	many :cached_critiques, :class_name => "CachedCritique"
	many :critique_votes, :class_name => "CritiqueVote"
end