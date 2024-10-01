'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('GPT', {
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
        allowNull: false,
        type: Sequelize.STRING,
      },
      type: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      summary: {
        allowNull: false,
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable('GPT');
  }
};
