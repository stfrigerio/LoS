module.exports = (sequelize, DataTypes) => {
  class Mood extends sequelize.Sequelize.Model {}
  Mood.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true
    },
    date: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tag: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
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
    modelName: 'Mood',
    tableName: 'Mood',
    timestamps: true,
    underscored: true,
  });

  return Mood;
}
