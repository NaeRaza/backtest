const { DataTypes, Model} = require('sequelize')
const sequelize = require('../database/database')

class Client extends Model {}

Client.init({
    matricule: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nom: {
        type: DataTypes.STRING,
        allowNull: false
    },
    genre:{
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: "Client"
})

console.log(Client === sequelize.models.Client)

module.exports = Client