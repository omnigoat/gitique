set :application, "gitique"

#github stuff
set :repository,  "git@github.com:omnigoat/gitique.git"
set :scm, :git
set :scm_username, "omnigoat"
set :scm_passphrase, "4GreatJustice!"

set :use_sudo,    false
set :deploy_to,   "/home/gitiquer/#{application}"

#server login
set :user, "gitiquer"
set :password, "4GreatJustice!"

ssh_options[:forward_agent] = true

# will be different entries for app, web, db if you host them on different servers
server "184.106.168.45", :app, :web, :db, :primary => true

namespace :deploy do
  task :start, :roles => :app do
    run "touch #{current_release}/tmp/restart.txt"
  end

  task :stop, :roles => :app do
    # Do nothing.
  end

  desc "Restart Application"
  task :restart, :roles => :app do
    run "touch #{current_release}/tmp/restart.txt"
  end
end
