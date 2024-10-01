'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Money', 'account', {
            type: Sequelize.TEXT,
            allowNull: true
        });

        await queryInterface.addColumn('Tags', 'category', {
            type: Sequelize.TEXT,
            allowNull: true
        });

        await queryInterface.addColumn('Tasks', 'note', {
            type: Sequelize.TEXT,
            allowNull: true
        });

        await queryInterface.addColumn('Library', 'left_at', {
            type: Sequelize.INTEGER,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Money', 'account');
        await queryInterface.removeColumn('Tags', 'category');
        await queryInterface.removeColumn('Tasks', 'note');
        await queryInterface.removeColumn('Library', 'left_at');
    }
};