module.exports = (sequelize, DataTypes) => {
  class BooleanHabits extends sequelize.Sequelize.Model {}

  BooleanHabits.init({
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
      allowNull: false,
      field: 'habit_key'
    },
    value: {
      type: DataTypes.BOOLEAN,
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
    modelName: 'BooleanHabits',
    tableName: 'BooleanHabits',
    timestamps: true,
    underscored: true,
  });

  BooleanHabits.associate = function(models) {
    BooleanHabits.belongsTo(models.DailyNotes, { foreignKey: 'date', targetKey: 'date' });
  };

  return BooleanHabits;
};
  