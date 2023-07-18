const router = require("express").Router();
const User = require("../models/Client");
const Compte = require("../models/Compte");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const secretKey = crypto.randomBytes(64).toString("hex");

router.post("/register", async (req, res) => {
  try {
    const newUser = await User.create({
      matricule: req.body.matricule,
      nom: req.body.nom,
    });

    const savedUser = await newUser.save();

    const salt = await bcrypt.genSalt(10);
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
    });
  } catch (err) {
    res.status(500).json({ message: "Une erreur s'est produite" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const compte = await Compte.findOne({
      where: { email: req.body.email },
    });

    if (!compte) {
      return res.status(400).json({ message: "Coordonnées inexistantes" });
    }

    const validated = await bcrypt.compare(
      req.body.motdepasse,
      compte.motdepasse
    );

    if (!validated) {
      return res.status(400).json({ message: "Coordonnées invalides" });
    }

    const token = jwt.sign({ id: compte.id, email: compte.email }, secretKey, {
      expiresIn: "1h",
    });

    // Définir le cookie d'authentification
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Assurez-vous d'être en HTTPS en production
      maxAge: 3600000, // Durée de validité du cookie : 1 heure
    });

    res.status(200).json({ email: compte.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Une erreur s'est produite" });
  }
});

function authenticateToken(req, res, next) {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: "Token manquant" });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token invalide" });
    }

    req.user = user;
    next();
  });
}

router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await Compte.findByPk(userId, { include: User });

    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Une erreur s'est produite lors de la récupération du profil" });
  }
});

module.exports = router;
