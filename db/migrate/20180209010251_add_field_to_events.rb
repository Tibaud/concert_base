class AddFieldToEvents < ActiveRecord::Migration[5.1]
  def change
    add_column :events, :image_uid, :string
  end
end
