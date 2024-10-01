module.exports = (sequelize, DataTypes) => {
  class GPT extends sequelize.Sequelize.Model {}

  GPT.init({
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
      type: DataTypes.STRING,
    },
    type: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    summary: {
      allowNull: false,
      type: DataTypes.TEXT,
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
    modelName: 'GPT',
    tableName: 'GPT',
    timestamps: true,
    underscored: true,
  });

  return GPT;
};
