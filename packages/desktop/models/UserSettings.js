module.exports = (sequelize, DataTypes) => {
  class UserSettings extends sequelize.Sequelize.Model {}

  UserSettings.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true
    },
    settingKey: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'setting_key'
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at'
    }
  }, {
    sequelize,
    modelName: 'UserSettings',
    tableName: 'UserSettings', 
    timestamps: true,
    underscored: true,
  });
  
  return UserSettings;
}


