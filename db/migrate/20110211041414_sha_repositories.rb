require 'digest/sha1'

class ShaRepositories < ActiveRecord::Migration
  def self.up
  	add_column :repositories, :sha1, :string, :default => 'tba', :null => false

  	# for all existing repostiories, calculate their SHA1
  	Repository.all.each do |repo|
  		repo.sha1 = Digest::SHA1.hexdigest(repo.url)
  		repo.save
  	end

  end

  def self.down
  	remove_column :repositories, :sha1
  end
end
