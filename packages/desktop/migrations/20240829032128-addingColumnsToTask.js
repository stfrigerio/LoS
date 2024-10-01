'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Tasks', 'pillar_uuid', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'Pillars',
                key: 'uuid'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });
        await queryInterface.addColumn('Tasks', 'repeat', {
            type: Sequelize.STRING,
            allowNull: true,
        });
        await queryInterface.addColumn('Tasks', 'frequency', {
            type: Sequelize.STRING,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Tasks', 'pillar_uuid');
        await queryInterface.removeColumn('Tasks', 'repeat');
        await queryInterface.removeColumn('Tasks', 'frequency');
    }
};