'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Library', {
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
			title: {
				allowNull: false,
				type: Sequelize.STRING
			},
			seen: {
				allowNull: false,
				type: Sequelize.STRING
			},
			type: {
				allowNull: false,
				type: Sequelize.ENUM('movie', 'book', 'series', 'videogame', 'music')
			},
			genre: {
				allowNull: false,
				type: Sequelize.STRING
			},
			creator: {
				type: Sequelize.STRING
			},
			releaseYear: {
				type: Sequelize.STRING,
				field: 'release_year'
			},
			rating: {
				type: Sequelize.REAL
			},
			comments: {
				type: Sequelize.TEXT
			},
			mediaImage: {
				type: Sequelize.TEXT,
				field: 'media_image'
			},
			boxOffice: {
				type: Sequelize.TEXT,
				field: 'box_office'
			},
			plot: {
				type: Sequelize.TEXT
			},
			cast: {
				type: Sequelize.TEXT
			},
			writer: {
				type: Sequelize.TEXT
			},
			metascore: {
				type: Sequelize.REAL
			},
			ratingImdb: {
				type: Sequelize.REAL,
				field: 'rating_imdb'
			},
			tomato: {
				type: Sequelize.REAL
			},
			runtime: {
				type: Sequelize.STRING
			},
			awards: {
				type: Sequelize.TEXT
			},
			seasons: {
				type: Sequelize.INTEGER
			},
			modes: {
				type: Sequelize.STRING
			},
			igdbURL: {
				type: Sequelize.TEXT,
				field: 'igdb_url'
			},
			pages: {
				type: Sequelize.INTEGER
			},
			finished: {
				allowNull: false,
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
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('Library');
	}
};
