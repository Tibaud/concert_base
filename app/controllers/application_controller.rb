class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception
  include SessionsHelper

def login_required
    if current_user.blank?
        redirect_to('/')
        flash[:danger] = "Connecte toi pour accéder à ta page !"
    end
  end
end
