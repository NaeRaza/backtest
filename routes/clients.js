const router = require("express").Router();
const Client = require("../models/Client");
const Compte = require("../models/Compte");
const bcrypt = require("bcrypt");

//Voir la liste de toutes les utilisateurs
router.get("/list", (req, res) => {
  Compte.findAll({
    include: { model: Client, attributes: ["matricule", "nom"] },
  })
    .then((users) => {
      res.status(200).json(
        users.map((user) => {
          return {
            id: user.idClient,
            matricule: user.Client.matricule,
            nom: user.Client.nom,
            email: user.email,
            motdepasse: user.motdepasse,
          };
        })
      );
    })
    .catch((err) => {
      res.send(err);
    });
});

//Mise à jour du client

router.put("/:id", async (req, res) => {
  if (req.body.idClient === req.params.id) {
    if (req.body.motdepasse) {
      //Initialisation des variables pour hasher le mot de passe
      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hashSync(req.body.motdepasse, salt);
    }

    try {
      const updatedUser = await Compte.findByPk(req.params.id);

      if (!updatedUser) {
        return res.status(400).json("L'utilisateur n'a pas été trouvé");
      }

      if (req.body.motdepasse) {
        updatedUser.motdepasse = hashedPass;
      }
      if (req.body.email) {
        updatedUser.email = req.body.email;
      }

      // Enregistrez les modifications dans la base de données
      await updatedUser.save();
      res.status(200).json({"message": "L'utilisateur a été mis à jour avec succès"});
    } catch (err) {
      res.status(500).send(err);
    }
  } else {
    res.status(401).json("Vous pouvez seulement modifier votre compte");
  }
});

// Supprimer un client
router.delete('/client/:id', async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) {
      return res.status(404).json("Client non trouvé");
    }

    // Supprimer les comptes associés au client
    await Compte.destroy({
      where: {
        idClient: req.params.id
      }
    });

    // Supprimer le client lui-même
    await client.destroy();

    res.status(200).json("Client supprimé avec ses comptes associés");
  } catch (err) {
    res.status(500).send(err);
  }
});

// Supprimer un compte
router.delete('/compte/:id', async (req, res) => {
  try {
    const compte = await Compte.findByPk(req.params.id);
    if (!compte) {
      return res.status(404).json("Compte non trouvé");
    }

    // Supprimer le compte lui-même
    await compte.destroy();

    res.status(200).json("Compte supprimé avec succès");
  } catch (err) {
    console.error(err);
    res.status(500).json("Une erreur s'est produite lors de la suppression du compte");
  }
});

module.exports = router;
