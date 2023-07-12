//Initialisation des variables
const express = require('express')
const app = express()
const sequelize = require('./database/database')

//Initialisation des variables routes
const authRoutes = require('./routes/auth')


//Test de la connexion avec la base de donnée
  sequelize.authenticate()
  .then(() => {
    console.log('La base de données est prête');
  })
  .catch(err => {
    console.error('Erreur lors de la synchronisation de la base de données :', err);
  });

//middleware
app.use(express.json())

//Route middleware
app.use('/api/auth', authRoutes)



//Demmarage du serveur
app.listen(4000, ()=>{
    console.log('Le serveur est marche')
})