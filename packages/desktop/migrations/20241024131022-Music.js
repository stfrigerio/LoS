'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Music', {
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
            libraryUuid: { 
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Library',
                    key: 'uuid'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            trackName: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            durationMs: {
                type: Sequelize.INTEGER,
            },
            popularity: {
                type: Sequelize.INTEGER,
            },
            previewUrl: {
                type: Sequelize.STRING,
            },
            trackNumber: {
                type: Sequelize.INTEGER,
            },
            tempo: {
                type: Sequelize.STRING,
            },
            key: {
                type: Sequelize.STRING,
            },
            mode: {
                type: Sequelize.STRING,
            },
            timeSignature: {
                type: Sequelize.STRING,
            },
            danceability: {
                type: Sequelize.INTEGER,
            },
            energy: {
                type: Sequelize.INTEGER,
            },
            speechiness: {
                type: Sequelize.INTEGER,
            },
            acousticness: {
                type: Sequelize.INTEGER,
            },
            instrumentalness: {
                type: Sequelize.INTEGER,
            },
            liveness: {
                type: Sequelize.INTEGER,
            },
            valence: {
                type: Sequelize.INTEGER,
            },
            playCount: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            rating: {
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

        // Create indexes for better query performance
        await queryInterface.addIndex('Music', ['libraryUuid']);
        await queryInterface.addIndex('Music', ['trackName']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Music');
    }
};