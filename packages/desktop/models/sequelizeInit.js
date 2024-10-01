require('dotenv').config({ path: __dirname + '/../.env' });
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PASSWORD, 
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        port: process.env.DB_PORT,
        logging: false, //&
        define: {
            timestamps: true,
            freezeTableName: true,
        }
    }
);

sequelize.authenticate()
    .then(() => console.log('Connection has been established successfully.'))
    .catch(error => {
        console.error('Unable to connect to the database:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
    });

module.exports = sequelize;
