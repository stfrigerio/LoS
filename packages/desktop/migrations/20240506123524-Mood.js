'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Mood', {
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
        unique: false
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true // Allows NULL values
      },
      tag: {
        type: Sequelize.STRING,
        allowNull: true // Allows NULL values
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true // Allows NULL values
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
    await queryInterface.dropTable('Mood');
  }
};
