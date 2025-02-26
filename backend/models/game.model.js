const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Assuming you have a Sequelize instance

const Game = sequelize.define(
    'Game',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        gameCode: {
            type: DataTypes.STRING(6),
            allowNull: false,
            unique: true,
        },
        adminUserId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users', // This assumes a 'Users' table exists
                key: 'id',
            },
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: 'games',
        timestamps: false, // Disable automatic timestamps if your DB handles it
    },
);

module.exports = Game;
