'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BooleanHabits', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        unique: true
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        references: {
          model: 'DailyNotes',
          key: 'date'
        },
        onDelete: 'CASCADE'
      },
      habitKey: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'habit_key'
      },
      value: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'created_at'
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'updated_at'
      }
    });

    await queryInterface.addConstraint('BooleanHabits', {
      fields: ['date', 'habit_key'],
      type: 'unique',
      name: 'boolean_habits_date_habitKey_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('BooleanHabits');
  }
};
