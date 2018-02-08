class User < ApplicationRecord
    before_save { self.email = email.downcase }
    has_many :authored_events, :foreign_key => :creator_id, :class_name => 'Event'
    has_and_belongs_to_many :attended_events, :class_name => 'Event', :join_table => :events_users
    before_save { self.email = email.downcase }
    validates :name,  presence: true, length: { maximum: 50 }  
    VALID_EMAIL_REGEX = /\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i
    validates :email, presence: true, length: { maximum: 255 },
                    format: { with: VALID_EMAIL_REGEX },
                    uniqueness: { case_sensitive: false }
    validates :password, presence: true, length: { minimum: 8 }, on: :create
  	has_secure_password

    def User.digest(string)
      cost = ActiveModel::SecurePassword.min_cost ? BCrypt::Engine::MIN_COST :
                                                  BCrypt::Engine.cost
      BCrypt::Password.create(string, cost: cost)
    end
end
