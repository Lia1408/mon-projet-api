const pool = require('./db');

// INSCRIPTION
exports.registerUser = async (req, res) => {
  const {
    nom,
    prenom,
    email,
    mot_de_passe,
    nationalite,
    niveau_etudes,
    domaine_etudes,
    personne_a_prevenir,
    numero_tel,
    role
  } = req.body;

  try {
    // Vérifie si l'email existe déjà
    const check = await pool.query(
      'SELECT id_utilisateur FROM utilisateur WHERE email = $1',
      [email]
    );

    if (check.rows.length > 0) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    // Insertion de l'utilisateur
    await pool.query(
      `INSERT INTO utilisateur (
        nom, prenom, email, mot_de_passe, nationalite,
        niveau_etudes, domaine_etudes, personne_a_prevenir,
        numero_tel, role
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        nom,
        prenom,
        email,
        mot_de_passe,
        nationalite,
        niveau_etudes,
        domaine_etudes,
        personne_a_prevenir,
        numero_tel,
        role
      ]
    );

    res.status(201).json({ message: "Inscription réussie !" });

  } catch (error) {
    console.error("Erreur registerUser:", error);
    res.status(500).json({ message: "Erreur serveur lors de l'inscription." });
  }
};

//  CONNEXION
exports.loginUser = async (req, res) => {
  const { email, mot_de_passe } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM utilisateur WHERE email = $1 AND mot_de_passe = $2',
      [email, mot_de_passe]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Identifiants incorrects." });
    }

    const user = result.rows[0];
    res.status(200).json({ message: `Bienvenue ${user.nom} !`, user });

  } catch (error) {
    console.error("Erreur loginUser:", error);
    res.status(500).json({ message: "Erreur serveur lors de la connexion." });
  }
};
