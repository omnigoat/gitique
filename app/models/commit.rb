require "critique"


#======================================================================
#======================================================================
class Commit
	include MongoMapper::Document

	belongs_to :repository_backend

	key :sha1, String, :index => true
	key :genesis, String, :index => true
	
	# array of ____?
	#many :children, :class_name => "Commit"
	#many :parents, :class_name => "Commit"

	# votes upon critiques for this particular commit
	many :critique_votes

	# cached totalled votes for critiques. if a critique doesn't
	# appear in here, but it appears in its parents, it means it
	# is no longer valid
	many :cached_critiques, :class_name => "CachedCritique"
end










