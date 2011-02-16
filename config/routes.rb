Gitique::Application.routes.draw do
  get "pages/random"
  
  match "repositories", :to => 'repositories#main'
  match "repositories/add", :to => 'repositories#add'
  match "repositories/remove", :to => 'repositories#remove'
  
  match "critiques/add", :to => 'critiques#add'
  match "critiques/get_all", :to => 'critiques#get_all'
  
  
  match "pages/random/post", :to => "pages#post"
  match "pages/ajax/load", :to => 'pages#load'
  
  
  match "ajax/load", :to => 'ajax#load'
  
  #
  # users
  #
  get  "signup",    :to => "users#new"
  post "signup",    :to => "users#create"
  get  "users",     :to => "users#index"
  get  ":username", :to => "users#show"
  
end
