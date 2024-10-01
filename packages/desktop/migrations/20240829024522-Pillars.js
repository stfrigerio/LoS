'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Pillars', {
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
            name: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            emoji: {
                type: Sequelize.STRING,
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
        await queryInterface.dropTable('Pillars');
    }
};