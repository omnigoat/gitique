Gitique::Application.routes.draw do
  get "pages/random"
  
  get "/", :to => "apikaiyay#test"
  
  match "pages/random/post", :to => "pages#post"
  match "pages/ajax/load", :to => 'pages#load'
  
  #
  # critiques
  #
  post "critique",  :to => "critiques#new"
  get  "critiques",  :to => "critiques#index"

  #
  # repositories
  #
  
  get "repositories", :to => 'repositories#main'
  post "repositories/disambiguate", :to => 'repositories#disambiguate'
  post "repositories/add", :to => 'repositories#add'
  delete "repositories", :to => 'repositories#remove'
  post "repositories/remove_db"

  #
  # users
  #
  get  "signup",    :to => "users#new"
  post "signup",    :to => "users#create"
  get  "users",     :to => "users#index"
  get ":username", :to => "users#show"




  get ":username/:repo_name", :to => "repositories#show"
  get ":username/:repo_name/tree/:branch(/*path)", :to => "repositories#structure"
  
end
