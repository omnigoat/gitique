


class CritiquesController < ApplicationController
	def index
		@critiques = Critique.all
		respond_to do |format|
			format.html { render :nothing => true }
			format.js { render :nothing => true, :js => @critiques.to_json }
		end
	end
	
	def new
		genesis = params[:repo_genesis]

		db_commit = Commit.find_by_genesis_and_sha1(params[:repo_genesis], params[:commit_id])
		throw "bad commit" if db_commit.nil?

		#=======================================================================
		# build node graph
		#=======================================================================
		fs_repo = Grit::Repo.new db_commit.repository.path, :is_bare => true

		commit_nodes = {}
		fs_repo.branches.each do |branch|
			RepoTree::build_commit_tree commit_nodes, branch.commit
		end

		
		#=======================================================================
		# propagate critique
		#=======================================================================
		root = commit_nodes[genesis]

		RepoTree::for_each root, do |node|
			db_commit = Commit.find_by_genesis_and_sha1(genesis, node.id)
			throw "bad commit" if db_commit.nil?
			merged_critiques = {}
			
			node.parents.each do |parent|
				db_parent =	Commit.find_by_genesis_and_sha1(genesis, parent.id)
				throw "bad commit-parent" if db_parent.nil?

				db_parent.cached_critiques.each do |cc|
					mc = merged_critiques[cc.critique._id] ||= {
						:critique => cc.critique,
						:votes_up => 0,
						:votes_down => 0
					}

					mc[:votes_up] += cc.votes_up
					mc[:votes_down] += cc.votes_down
				end
			end

			merged_critiques.each do |key, mc|
				if mc.votes_up / mc.votes_down > 5
					db_commit.cached_critiques << CachedCritique.build(mc)
				end
			end

			db_commit.save!
		end


		respond_to do |format|
			format.html { render :nothing => true }
			format.js { render :nothing => true }
		end
	end
end
