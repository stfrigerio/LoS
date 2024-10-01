'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('People', {
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
            allowNull: false
        },
        middleName: {
            type: Sequelize.STRING,
            field: 'middle_name'
        },
        lastName: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'last_name'
        },
        birthDay: {
            type: Sequelize.DATEONLY,
            allowNull: true,
            field: 'birth_day'
        },
        email: Sequelize.STRING,
        phoneNumber: {
            type: Sequelize.STRING,
            field: 'phone_number'
        },
        address: Sequelize.STRING,
        city: Sequelize.STRING,
        state: Sequelize.STRING,
        pronouns: Sequelize.STRING,
        category: {
            type: Sequelize.STRING,
            allowNull: false
        },
        notificationEnabled: {
            type: Sequelize.STRING,
            field: 'notification_enabled',
            allowNull: false,
        },
        frequencyOfContact: {
            type: Sequelize.STRING,
            field: 'frequency_of_contact',
            allowNull: true
        },
        occupation: Sequelize.STRING,
        partner: Sequelize.STRING,
        likes: Sequelize.TEXT,
        dislikes: Sequelize.TEXT,
        description: Sequelize.TEXT,
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
        await queryInterface.dropTable('People');
    }
};