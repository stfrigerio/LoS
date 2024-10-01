'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserSettings', {
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
      settingKey: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        field: 'setting_key'
      },
      value: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      type: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('UserSettings');
  }
};