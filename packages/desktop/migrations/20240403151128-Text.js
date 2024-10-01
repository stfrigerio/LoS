'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Text', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      uuid: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        unique: true
      },
      period: {
        type: Sequelize.STRING,
        allowNull: false
      },
      key: {
        type: Sequelize.STRING
      },
      text: {
        type: Sequelize.TEXT,
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Text');
  }
};