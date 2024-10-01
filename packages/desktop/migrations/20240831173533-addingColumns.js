'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Pillars', 'description', {
            type: Sequelize.TEXT,
            allowNull: true
        });

        await queryInterface.addColumn('Journal', 'place', {
            type: Sequelize.TEXT,
            allowNull: true
        });

        await queryInterface.addColumn('Tasks', 'objective_uuid', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'Objectives',
                key: 'uuid'
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Pillars', 'description');
        await queryInterface.removeColumn('Journal', 'place');
        await queryInterface.removeColumn('Tasks', 'objective_uuid');
    }
};