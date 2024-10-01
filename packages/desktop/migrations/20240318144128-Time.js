'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Time', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        unique: true
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      tag: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      },
      duration: {
        type: Sequelize.TIME,
        allowNull: true
      },
      start_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: true
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
  
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Time');
  }
};
