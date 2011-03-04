

class CommitNode
	@children = []

	attr :id
	attr_accessor :children, :parents, :visited_parents
	

	def initialize id
		@id = id
		@children = Set.new
		@parents = Set.new
		@visited_parents = Set.new
	end
end





module CommitNode



	def self.for_each node, options = {}, &block
		options = {:after_all_parents => true}.merge(options)

		def for_each_impl options, node, parent, &block
			if options[:after_all_parents]
				# throw if the parent is good but not present in the child's visited-parent list
				throw if not parent.nil? and node.visited_parents.delete(parent).nil?
				if node.visited_parents.empty?
					yield node
				else
					return
				end
			else
				yield node
			end

			node.children.each do |child|
				for_each_impl options, child, node, &block
			end
		end

		if options[:after_all_parents]
			def build_history node
				node.visited_parents = node.parents.dup
				node.children.each do |child|
					build_history child
				end
			end

			build_history node
		end

		for_each_impl options, node, nil, &block
	end


	def self.propagate_critiques genesis, node, db_commit = nil
		# limit db pulls
		if db_commit.nil?
			db_commit = Commit.find(:genesis => genesis, :sha1 => node.id) or Commit.new(:genesis => genesis, :sha1 => node.id)
		end

		node.children.each do |child|
			db_child = Commit.find(:genesis => genesis, :sha1 => child.id) or Commit.new(:genesis => genesis, :sha1 => child.id)
			
			db_commit.cached_critiques.each do |cc|
				child_cc = db_child.cached_critiques.find(:username => cc.username, :direction => cc.dirction, :critique => cc.critique)

				if cc.votes_up / cc.votes_down > 5
					db_child.cached_critiques << CachedCritique.build(:username => cc.username, :direction => cc.dirction, :critique => cc.critique)
				end
			end
		end
	end



	#=======================================================================
	# builds a two-way tree
	#=======================================================================
	def self.build_commit_tree commit_nodes, commit, commit_to
		def associate commit, parent, commit_nodes
			parent_node = commit_nodes[parent.id] ||= CommitNode.new(parent.id)
			child_node = commit_nodes[commit.id]
			throw if child_node.nil?

			parent_node.children.add? child_node
			child_node.parents.add? parent_node
		end

		until commit.nil?
			break if (not commit_to.nil?) and commit == commit_to

			commit_nodes[commit.id] ||= CommitNode.new(commit.id)
			
			if commit.parents.length == 1
				associate commit, commit.parents[0], commit_nodes
				commit = commit.parents[0]
			else
				commit.parents.each do |parent|
					associate commit, parent, commit_nodes
					build_commit_tree parent, commit_nodes
				end
				commit = nil
			end
		end
	end


	#=======================================================================
	#=======================================================================
	def self.print_commit_tree commit, spaces, siblings = 0
		return false if commit.nil?

		if siblings > 0
			puts ":" + (" " * (spaces - 1)) + "*" + commit.id
		else
			puts ":" + (" " * spaces) + commit.id
		end
	
		commit.children.each do |child|
			print_commit_tree child, spaces + (commit.children.length > 1 ? 1 : 0), commit.children.length - 1
		end
	end
end















