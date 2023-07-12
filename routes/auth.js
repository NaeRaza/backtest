const router = require("express").Router();
const User = require("../models/Client");
const Compte = require("../models/Compte");
const bcrypt = require("bcrypt")

//Création d'un client et inscription
router.post("/register", async (req, res) => {
  try {
    const newUser = await User.create({
      matricule: req.body.matricule,
      nom: req.body.nom,
    });

    const savedUser = await newUser.save();

    //Initialisation des variables pour hasher le mot de passe
    const salt = await bcrypt.genSalt(10)
    const hashedPass = await bcrypt.hashSync(req.body.motdepasse, salt);

    const newAccount = await Compte.create({
      email: req.body.email,
      motdepasse: hashedPass,
      idClient: savedUser.id,
    });
    const savedAccount = await newAccount.save();

    res.status(201).json({
      idClient: savedUser.id,
      nom: savedUser.nom,
      matricule: savedUser.matricule,
      email: savedAccount.email,
      motdepasse: savedAccount.motdepasse
    });
  } catch (err) {
    res.json(err);
  }
});

//Se connecter
router.post("/login", async (req, res) => {
  try {
    const compte = await Compte.findOne({
      where: { email: req.body.email },
    });
    if (!compte) {
      return res.status(400).json("Coordonnée inexistante");
    }

    const validated = await bcrypt.compare(req.body.motdepasse, compte.motdepasse);
    if (!validated) {
      return res.status(400).json("Coordonnée inexistante");
    }

    res.status(200).json({ 
      id : compte.id,
      email : compte.email,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json("Une erreur s'est produite");
  }
});


module.exports = router;
