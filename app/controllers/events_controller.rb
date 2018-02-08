class EventsController < ApplicationController
  def new
    if logged_in?
      @event = Event.new
    else
      flash[:danger] = "Connecte toi pour créer événement !"
      redirect_to login_path
    end
  end

  def create
    @user = current_user
    @event = @user.authored_events.new(event_params)
    if @event.save
      flash[:success] = "L'événement a bien été créé !"
      redirect_to current_user
      @event.user_attendees << current_user
      @event.save
    else
      render 'new'
    end
  end

  def event_params
     params.require(:event).permit(:name, :description, :date, :place)
  end

  def show
    if logged_in?
      @event = Event.find(params[:id])
      @users = User.all
    else
      flash[:danger] = "Connecte toi pour accéder à l'événement !"
      redirect_to login_path
    end
  end

  def index
    @events = Event.all
  end

  def attend
    if logged_in?
      @event = Event.find(params[:id])
      @event.user_attendees << current_user
      @event.save
      flash[:success] = "Vous êtes inscrit à l'événement !"
      redirect_to events_path
    else
      redirect_to login_path
    end
  end

  def invite
    @event = Event.find(params[:id])
    @user = User.find(params[:user])
    @event.user_attendees << @user
    @event.save
    flash[:success] = "Vous avez ajouté votre ami à l'événement !"
    redirect_to @event
  end

  def unattend
    @event = Event.find(params[:id])
    @event.user_attendees.delete(current_user)
    @event.save
    flash[:success] = "Vous êtes désinscrit !"
    redirect_to current_user
  end

  def destroy
    @user = current_user
    @event = Event.find(params[:id])
    @event.destroy
    flash[:success] = "Évenement supprimé !"
    redirect_to @current_user
  end

  def edit
    @user =  current_user
    @event = Event.find(params[:id])
    if logged_in? && current_user == @user
      edit_event_path
    else
      redirect_to login_path
    end
  end

  def update
      @user = current_user
      @event = Event.find(params[:id])
      if logged_in? && @current_user == @user
        if @event.update_attributes(event_params)
           flash[:success] = "Événement edité !"
           redirect_to event_path
       else
          render 'edit'
       end
     else
      redirect_to login_path
    end
  end

end
