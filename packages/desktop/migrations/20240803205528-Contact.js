'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Contact', {
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
        personId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
            model: 'People',
            key: 'id'
            },
            field: 'person_id'
        },
        dateOfContact: {
            type: Sequelize.DATEONLY,
            allowNull: false,
            field: 'date_of_contact'
        },
        synced: {
            type: Sequelize.INTEGER,
            defaultValue: 0
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
        await queryInterface.dropTable('Contacts');
    }
};