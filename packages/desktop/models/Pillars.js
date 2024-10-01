module.exports = (sequelize, DataTypes) => {
    class Pillars extends sequelize.Sequelize.Model {}
    Pillars.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        uuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            unique: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        emoji: {
            type: DataTypes.STRING,
            allowNull: true,
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
        modelName: 'Pillars',
        tableName: 'Pillars',
        timestamps: true,
        underscored: true,
    });

    Pillars.associate = (models) => {
        Pillars.hasMany(models.Objectives, { foreignKey: 'pillarUuid', as: 'objectives' });
        Pillars.hasMany(models.Tasks, { foreignKey: 'pillarUuid', as: 'tasks' });
    };

    return Pillars;
}