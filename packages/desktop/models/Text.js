
module.exports = (sequelize, DataTypes) => {
  class Text extends sequelize.Sequelize.Model {}

  Text.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    uuid: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    period: {
      type: DataTypes.STRING,
      allowNull: false
    },
    key: {
      type: DataTypes.STRING
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false
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
    modelName: 'Text',
    tableName: 'Text', 
    timestamps: true,
    underscored: true,
  });

  return Text;
};