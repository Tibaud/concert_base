class Event < ApplicationRecord
    has_and_belongs_to_many :user_attendees, :class_name => 'User', :join_table => :events_users
    belongs_to :creator, :class_name => 'User'
    validates :name,  presence: true, uniqueness: true
    validates :description,  presence: true
    validates :date,  presence: true
    validates :place,  presence: true

end
