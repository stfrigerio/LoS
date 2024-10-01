module.exports = (sequelize, DataTypes) => {
    class Money extends sequelize.Sequelize.Model {}

    Money.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        uuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            unique: true
        },
        date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        amount: {
            type: DataTypes.REAL,
            allowNull: true
        },
        type: {
            type: DataTypes.STRING,
            allowNull: true
        },
        tag: {
            type: DataTypes.STRING,
            allowNull: true
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        due: {
            type: DataTypes.DATE,
            allowNull: true
        },
        account: {
            type: DataTypes.STRING,
            allowNull: true
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
        modelName: 'Money',
        tableName: 'Money',
        timestamps: true,
        underscored: true,
    });

    return Money;
};
