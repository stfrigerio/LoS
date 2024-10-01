'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Tasks', {
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
      text: {
        type: Sequelize.STRING
      },
      due: {
        type: Sequelize.DATE,
        allowNull: true
      },
      completed: {
        type: Sequelize.BOOLEAN
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
    await queryInterface.dropTable('Tasks');
  }
};

