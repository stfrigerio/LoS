module.exports = (sequelize, DataTypes) => {
    class Time extends sequelize.Sequelize.Model {}
    Time.init({
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
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        tag: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        duration: {
            type: DataTypes.TIME,
            allowNull: true
        },
        startTime: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'start_time'
        },
        endTime: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'end_time'
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
        modelName: 'Time',
        tableName: 'Time',
        timestamps: true,
        underscored: true,
    });

    return Time;
};
