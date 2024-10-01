module.exports = (sequelize, DataTypes) => {
    class People extends sequelize.Sequelize.Model {}
    
    People.init({
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
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    middleName: DataTypes.STRING,
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    birthDay: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    email: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    pronouns: DataTypes.STRING,
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    notificationEnabled: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    frequencyOfContact: {
        type: DataTypes.STRING,
        allowNull: true
    },
    occupation: DataTypes.STRING,
    partner: DataTypes.STRING,
    likes: DataTypes.TEXT,
    dislikes: DataTypes.TEXT,
    description: DataTypes.TEXT,
    aliases: DataTypes.TEXT,
    country: DataTypes.STRING,
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
        modelName: 'People',
        tableName: 'People',
        timestamps: true,
        underscored: true
    });

    return People;
};