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
                field: 'library_uuid',
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
                unique: true,
                field: 'track_name'
            },
            fileName: {
                type: Sequelize.STRING,
                field: 'file_name'
            },
            durationMs: {
                type: Sequelize.INTEGER,
                field: 'duration_ms'
            },
            popularity: {
                type: Sequelize.INTEGER,
            },
            previewUrl: {
                type: Sequelize.STRING,
                field: 'preview_url'
            },
            trackNumber: {
                type: Sequelize.INTEGER,
                field: 'track_number'
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
                field: 'time_signature'
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
                defaultValue: 0,
                field: 'play_count'
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
        await queryInterface.addIndex('Music', ['library_uuid']);
        await queryInterface.addIndex('Music', ['track_name']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Music');
    }
};