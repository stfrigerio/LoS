module.exports = (sequelize, DataTypes) => {
    class Music extends sequelize.Sequelize.Model {}
    Music.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        uuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            unique: true
        },
        libraryUuid: {
            type: DataTypes.UUID,
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
            type: DataTypes.STRING,
            allowNull: false
        },
        fileName: {
            type: DataTypes.STRING,
            field: 'file_name'
        },
        trackNumber: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'track_number'
        },
        durationMs: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'duration_ms'
        },
        popularity: {
            type: DataTypes.INTEGER
        },
        previewUrl: {
            type: DataTypes.STRING
        },
        // Audio Features
        tempo: {
            type: DataTypes.FLOAT,
            allowNull: false,
            comment: 'BPM (beats per minute)'
        },
        key: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'Musical key (C, C#, etc.)'
        },
        mode: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'Major or Minor'
        },
        timeSignature: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'Time signature (e.g., 4/4)',
            field: 'time_signature'
        },
        // Audio characteristics (0-100)
        danceability: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0,
                max: 100
            }
        },
        energy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0,
                max: 100
            }
        },
        speechiness: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0,
                max: 100
            }
        },
        acousticness: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0,
                max: 100
            }
        },
        instrumentalness: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0,
                max: 100
            }
        },
        liveness: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0,
                max: 100
            }
        },
        valence: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0,
                max: 100
            }
        },
        playCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
            field: 'play_count'
        },
        rating: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'created_at'
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'updated_at'
        }
    }, {
        sequelize,
        modelName: 'Music',
        tableName: 'Music',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                fields: ['library_uuid']
            },
            {
                fields: ['track_name']
            },
            {
                fields: ['play_count']
            }
        ]
    });

    Music.associate = (models) => {
        Music.belongsTo(models.Library, {
            foreignKey: 'library_uuid',
            targetKey: 'uuid',
            as: 'library'
        });
    };

    return Music;
};