'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Tags', {
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
        type: Sequelize.TEXT,
        allowNull: false
      },
      type: {
        type: Sequelize.TEXT
      },
      emoji: {
        type: Sequelize.TEXT
      },
      linkedTag: {
        type: Sequelize.TEXT,
        field: 'linked_tag'
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

    // Add unique constraint
    await queryInterface.addConstraint('Tags', {
      fields: ['text', 'type'],
      type: 'unique',
      name: 'unique_text_type'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Tags');
  }
};