const router = require("express").Router();
const User = require("../models/Client");
const Compte = require("../models/Compte");

//Création d'un client
router.post("/register", async (req, res) => {
  try {
    const newUser = await User.create({
      matricule: req.body.matricule,
      nom: req.body.nom,
    });

    const savedUser = await newUser.save();

    const newAccount = await Compte.create({
      email: req.body.email,
      motdepasse: req.body.motdepasse,
      idClient: savedUser.id,
    });
    const savedAccount = await newAccount.save();

    res.status(201).json({
      idClient: savedUser.id,
      nom: savedUser.nom,
      matricule: savedUser.matricule,
      email: savedAccount.email,
    });
  } catch (err) {
    res.json(err);
  }
});

module.exports = router;
