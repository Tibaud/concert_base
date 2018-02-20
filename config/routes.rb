Rails.application.routes.draw do
  devise_for :models
  root 'events#index'
  get '/flynn', to:'events#flynn'
  #utilisateurs
  get '/signup', to:'users#new'
  post '/signup', to:'users#create'
  #sessions
  get    '/login',   to: 'sessions#new'
  post   '/login',   to: 'sessions#create'
  delete '/logout',  to: 'sessions#destroy'

  resources :users
  #evenements
  resources :events do
    post 'attend', on: :member
    post 'unattend', on: :member
    post 'invite', on: :member
  end
end
