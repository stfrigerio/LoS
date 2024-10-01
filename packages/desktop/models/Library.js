module.exports = (sequelize, DataTypes) => {
    class Library extends sequelize.Sequelize.Model {}
    Library.init({
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
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        seen: {
            type: DataTypes.STRING,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('movie', 'book', 'series', 'videogame'),
            allowNull: false
        },
        genre: {
            type: DataTypes.STRING,
            allowNull: false
        },
        creator: {
            type: DataTypes.STRING
        },
        releaseYear: {
            type: DataTypes.STRING,
            field: 'release_year'
        },
        rating: {
            type: DataTypes.REAL
        },
        comments: {
            type: DataTypes.TEXT
        },
        mediaImage: {
            type: DataTypes.TEXT,
            field: 'media_image'
        },
        boxOffice: {
            type: DataTypes.TEXT,
            field: 'box_office'
        },
        plot: {
            type: DataTypes.TEXT
        },
        cast: {
            type: DataTypes.TEXT
        },
        writer: {
            type: DataTypes.TEXT
        },
        metascore: {
            type: DataTypes.REAL
        },
        ratingImdb: {
            type: DataTypes.REAL,
            field: 'rating_imdb'
        },
        tomato: {
            type: DataTypes.REAL
        },
        runtime: {
            type: DataTypes.STRING
        },
        awards: {
            type: DataTypes.TEXT
        },
        seasons: {
            type: DataTypes.INTEGER
        },
        modes: {
            type: DataTypes.STRING
        },
        igdbURL: {
            type: DataTypes.TEXT,
            field: 'igdb_url'
        },
        pages: {
            type: DataTypes.INTEGER
        },
        finished: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        leftAt: {
            type: DataTypes.DATE,
            allowNull: true,
            // field: "left_at"
        },
        isMarkedForDownload: {
            type: DataTypes.INTEGER,
            field: 'is_marked_for_download'
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
        modelName: 'Library',
        tableName: 'Library',
        timestamps: true,
        underscored: true,
    });

    return Library;
};
