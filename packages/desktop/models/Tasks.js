module.exports = (sequelize, DataTypes) => {
    class Tasks extends sequelize.Sequelize.Model {}
    Tasks.init({
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
        text: {
            type: DataTypes.STRING,
            allowNull: false, 
        },
        completed: {
            type: DataTypes.BOOLEAN,
            allowNull: false, 
            defaultValue: false,
        },
        due: {
            type: DataTypes.DATE,
            allowNull: true,
        },  
        note: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        priority: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        objectiveUuid: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'objective_uuid'
        },
        pillarUuid: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'pillar_uuid'
        },
        repeat: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        frequency: {
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
        modelName: 'Tasks',
        tableName: 'Tasks', 
        timestamps: true,
        underscored: true,
    });

    Tasks.associate = (models) => {
        Tasks.belongsTo(models.Pillars, { foreignKey: 'pillarUuid', as: 'pillar' });
        Tasks.belongsTo(models.Objectives, { foreignKey: 'objectiveUuid', as: 'objective' });
    };

    return Tasks;
}