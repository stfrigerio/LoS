'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('Money', 'date', {
            type: Sequelize.DATE,
        });

        await queryInterface.changeColumn('Money', 'amount', {
            type: Sequelize.REAL,
        });

        await queryInterface.changeColumn('Money', 'type', {
            type: Sequelize.STRING,
        });

        await queryInterface.changeColumn('Money', 'tag', {
            type: Sequelize.STRING,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('Money', 'date', {
            type: Sequelize.DATE,
            allowNull: false,
        });

        await queryInterface.changeColumn('Money', 'amount', {
            type: Sequelize.REAL,
            allowNull: false,
        });

        await queryInterface.changeColumn('Money', 'type', {
            type: Sequelize.STRING,
            allowNull: false,
        });

        await queryInterface.changeColumn('Money', 'tag', {
            type: Sequelize.STRING,
            allowNull: false,
        });
    }
};