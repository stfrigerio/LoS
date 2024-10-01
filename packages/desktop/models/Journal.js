module.exports = (sequelize, DataTypes) => {
  class Journal extends sequelize.Sequelize.Model {}

  Journal.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true
    },
    date: {
      allowNull: false,
      type: DataTypes.STRING
    },
    place: {
      allowNull: true,
      type: DataTypes.TEXT
    },
    text: {
      allowNull: false,
      type: DataTypes.TEXT
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
    modelName: 'Journal',
    tableName: 'Journal',
    timestamps: true,
    underscored: true,
  });

  return Journal;
};
  