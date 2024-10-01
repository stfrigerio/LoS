module.exports = (sequelize, DataTypes) => {
  class Tags extends sequelize.Sequelize.Model {}

  Tags.init({
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
    text: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.TEXT
    },
    emoji: {
      type: DataTypes.TEXT
    },
    linkedTag: {
      type: DataTypes.TEXT
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true
    },
    category: {
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
    modelName: 'Tags',
    tableName: 'Tags',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['text', 'type']
      }
    ]
  });

  return Tags;
};