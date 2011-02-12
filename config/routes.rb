Gitique::Application.routes.draw do
  get "pages/random"
  
  match "repositories", :to => 'repositories#main'
  match "repositories/add", :to => 'repositories#add'
  match "repositories/remove", :to => 'repositories#remove'
  
  match "critiques/add", :to => 'critiques#add'
  match "critiques/get_all", :to => 'critiques#get_all'
  
  
  match "pages/random/post", :to => "pages#post"
  
  # get "pages/ajax/load"
  
  match "pages/ajax/load", :to => 'pages#load'
  
  
  match "ajax/load", :to => 'ajax#load'
  match "users", :to => "users#main"
end
