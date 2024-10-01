'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Objectives', {
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
            period: {
                type: Sequelize.STRING,
            },
            objective: {
                type: Sequelize.STRING,
            },
            pillar_uuid: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Pillars',
                    key: 'uuid'
                },
                field: 'pillar_uuid'
            },
            completed: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            note: {
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
        await queryInterface.dropTable('Objectives');
    }
};