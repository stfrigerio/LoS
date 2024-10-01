module.exports = (sequelize, DataTypes) => {
    class Objectives extends sequelize.Sequelize.Model {}
    Objectives.init({
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
        period: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        objective: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        pillarUuid: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'pillar_uuid'
        },
        note: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        completed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
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
        modelName: 'Objectives',
        tableName: 'Objectives',
        timestamps: true,
        underscored: true,
    });

    Objectives.associate = (models) => {
        Objectives.belongsTo(models.Pillars, { foreignKey: 'pillarUuid', as: 'pillar' });
        Objectives.hasMany(models.Tasks, { foreignKey: 'objectiveUuid', as: 'tasks' });
    };

    return Objectives;
}