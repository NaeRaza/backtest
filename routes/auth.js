const router = require("express").Router();
const User = require("../models/Client");
const Compte = require("../models/Compte");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Génération de la clé secrète
const secretKey = crypto.randomBytes(64).toString("hex");

// Création d'un client et inscription
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
      motdepasse: savedAccount.motdepasse,
    });
  } catch (err) {
    res.json(err);
  }
});

// Se connecter
router.post("/login", async (req, res) => {
  try {
    const compte = await Compte.findOne({
      where: { email: req.body.email },
    });
    if (!compte) {
      return res.status(400).json("Coordonnée inexistante");
    }

    const validated = await bcrypt.compare(
      req.body.motdepasse,
      compte.motdepasse
    );
    if (!validated) {
      return res.status(400).json("Coordonnée inexistante");
    }

    // Générez le token JWT avec les informations utilisateur
    const accessToken = jwt.sign(
      { id: compte.id, email: compte.email },
      secretKey,
      {
        expiresIn: "1h", // Définissez une expiration appropriée pour votre token
      }
    );

    res.status(200).json({ email: compte.email, accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json("Une erreur s'est produite");
  }
});

// Middleware d'authentification avec JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

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

// Exemple d'utilisation du middleware d'authentification pour une route protégée
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await Compte.findByPk(userId, { include: User });

    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json("Une erreur s'est produite lors de la récupération du profil");
  }
});

module.exports = router;
