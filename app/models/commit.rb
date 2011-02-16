
class Commit
	include MongoMapper::Document

	key :sha1, String, :index => true
	# array of ObjectIDs corresponding to the Critiques
	key :critiques, Array

	# votes upon critiques for this particular commit
	many :critique_votes
	# cached totalled votes for critiques
	many :totalled_critique_votes
end


class CritiqueVote
	include MongoMapper::EmbeddedDocument

	belongs_to :commit

	key :path, String, :index => true
	key :username, String
	key :direction, Int
end

class TotalledCritiqueVote
	include MongoMapper::EmbeddedDocument

	belongs_to :commit

	key :path, String, :index => true
	key :votes_up, Int
	key :votes_down, Int
end


class Critique
	# path of the file
	key :path, String, :index => true

	# an array of arrays of integers, signifying the lines in question
	key :lines, Array

	# username
	key :username, String, :index => true
	# what was actually said
	key :remarks, String
end
