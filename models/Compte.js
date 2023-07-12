const { DataTypes, Model} = require('sequelize')
const sequelize = require('../database/database')
const Client = require('./Client')

class Compte extends Model {}

Compte.init({
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    motdepasse: {
        type: DataTypes.STRING,
        allowNull: false
    },
    idClient: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references :{
            model: Client,
            key: 'id'
        }
    }
}, {
    sequelize,
    modelName: 'Compte'
})

console.log(Compte === sequelize.models.Compte)

Compte.belongsTo(Client, {
    foreignKey : 'idClient',
    onDelete: 'CASCADE'
})

module.exports = Compte