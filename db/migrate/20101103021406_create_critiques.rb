class CreateCritiques < ActiveRecord::Migration
  def self.up
    create_table :critiques do |t|
      t.string :comments

      t.timestamps
    end
  end

  def self.down
    drop_table :critiques
  end
end
