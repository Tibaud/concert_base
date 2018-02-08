Rails.application.routes.draw do

  root 'static_pages#home'

  #users
  get '/signup', to:'users#new'
  post '/signup', to:'users#create'

  #Sessions
  get    '/login',   to: 'sessions#new'
  post   '/login',   to: 'sessions#create'
  delete '/logout',  to: 'sessions#destroy'
 
  resources :users
  resources :events do
    post 'attend', on: :member
    post 'unattend', on: :member
    post 'invite', on: :member
  end
end
