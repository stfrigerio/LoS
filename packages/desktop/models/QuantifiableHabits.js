module.exports = (sequelize, DataTypes) => {
  class QuantifiableHabits extends sequelize.Sequelize.Model {}

  QuantifiableHabits.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    habitKey: {
      type: DataTypes.STRING,
      allowNull: false
    },
    value: {
      type: DataTypes.INTEGER,
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
    modelName: 'QuantifiableHabits',
    tableName: 'QuantifiableHabits',
    timestamps: true,
    underscored: true,
  });

  QuantifiableHabits.associate = function(models) {
      QuantifiableHabits.belongsTo(models.DailyNotes, { foreignKey: 'date', targetKey: 'date' });
  };
    
  return QuantifiableHabits;
};
  