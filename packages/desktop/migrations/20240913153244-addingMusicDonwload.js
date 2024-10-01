'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Library', 'is_marked_for_download', {
            type: Sequelize.INTEGER,
            allowNull: true
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Library', 'is_marked_for_download');
    }
};