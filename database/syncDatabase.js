const sequelize = require('./database')
const Client = require('../models/Client')
const Compte = require('../models/Compte')

async function syncDatabase(){
    try{
        await sequelize.sync({force : false})
    }
    catch(err){
        console.log(err)
    }
    finally {
        sequelize.close()
    }
}

syncDatabase();