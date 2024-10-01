'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DailyNotes', {
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
        unique: true,
        allowNull: false
      },
      morningComment: {
        type: Sequelize.STRING,
        allowNull: true,
        field: "morning_comment"
      },
      energy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      wakeHour: {
        type: Sequelize.TIME,
        allowNull: true,
        field: "wake_hour"
      },
      success: {
        type: Sequelize.STRING,
        allowNull: true
      },
      beBetter: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'be_better'
      },
      dayRating: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'day_rating'
      },
      sleepTime: {
        type: Sequelize.TIME,
        allowNull: true,
        field: 'sleep_time'
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('DailyNotes');
  }
};