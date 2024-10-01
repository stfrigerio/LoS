module.exports = (sequelize, DataTypes) => {
    class Contact extends sequelize.Sequelize.Model {}
    
    Contact.init({
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        uuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            unique: true
        },
        personId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'People',
                key: 'id'
            }
        },
        dateOfContact: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        source: DataTypes.TEXT,
        type: DataTypes.STRING,
        peopleName: DataTypes.STRING,
        peopleLastname: DataTypes.STRING,
        synced: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Contact',
        tableName: 'Contact',
        timestamps: true,
        underscored: true
    });
    
    Contact.associate = (models) => {
        Contact.belongsTo(models.People, { foreignKey: 'personId' });
    };

    return Contact;
};