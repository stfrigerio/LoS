module.exports = (sequelize, DataTypes) => {
  class DailyNotes extends sequelize.Sequelize.Model {}

  DailyNotes.init({
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
      unique: true,
      allowNull: false
    },
    morningComment: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "morning_comment"
    },
    energy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    wakeHour: {
      type: DataTypes.TIME,
      allowNull: true,
      field: "wake_hour"
    },
    success: {
      type: DataTypes.STRING,
      allowNull: true
    },
    beBetter: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'be_better'
    },
    dayRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'day_rating'
    },
    sleepTime: {
      type: DataTypes.TIME,
      allowNull: true,
      field: 'sleep_time'
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
    },
  }, {
    sequelize,
    modelName: 'DailyNotes',
    tableName: 'DailyNotes',
    timestamps: true,
    underscored: true,
  });

  DailyNotes.associate = function(models) {
    DailyNotes.hasMany(models.BooleanHabits, { as: 'booleanHabits', foreignKey: 'date', sourceKey: 'date' });
    DailyNotes.hasMany(models.QuantifiableHabits, { as: 'quantifiableHabits', foreignKey: 'date', sourceKey: 'date' });
  };
  
  return DailyNotes;
};
