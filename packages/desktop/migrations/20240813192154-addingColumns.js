'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('People', 'aliases', {
        type: Sequelize.TEXT,
        allowNull: true
        });

        await queryInterface.addColumn('People', 'country', {
        type: Sequelize.STRING,
        allowNull: true
        });

        await queryInterface.addColumn('Contact', 'source', {
            type: Sequelize.TEXT,
            allowNull: true
        });
    
        await queryInterface.addColumn('Contact', 'type', {
            type: Sequelize.STRING,
            allowNull: true
        });
    
        await queryInterface.addColumn('Contact', 'people_name', {
            type: Sequelize.STRING,
            allowNull: true
        });
    
        await queryInterface.addColumn('Contact', 'people_lastname', {
            type: Sequelize.STRING,
            allowNull: true
        });

        await queryInterface.addColumn('Tasks', 'priority', {
            type: Sequelize.INTEGER,
            allowNull: true
        });

        await queryInterface.addColumn('Tasks', 'type', {
            type: Sequelize.STRING,
            allowNull: true
        });

        await queryInterface.addColumn('Tags', 'color', {
            type: Sequelize.STRING,
            allowNull: true
        });

        await queryInterface.addColumn('UserSettings', 'color', {
            type: Sequelize.STRING,
            allowNull: true
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('People', 'aliases');
        await queryInterface.removeColumn('People', 'country');
        await queryInterface.removeColumn('Contact', 'source');
        await queryInterface.removeColumn('Contact', 'type');
        await queryInterface.removeColumn('Contact', 'people_name');
        await queryInterface.removeColumn('Contact', 'people_lastname');
        await queryInterface.removeColumn('Tasks', 'priority');
        await queryInterface.removeColumn('Tasks', 'type');
        await queryInterface.removeColumn('Tags', 'color');
        await queryInterface.removeColumn('UserSettings', 'color');
    }
};