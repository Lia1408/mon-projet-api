const pool = require('./db');
const authService = require('./services/jwt.service');
const jwtConfig = require('./config/jwt.config');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
      'SELECT id_utilisateur FROM users WHERE email = $1',
      [email]
    );

    if (check.rows.length > 0) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(mot_de_passe, 12);
    const tokenVersion = crypto.randomBytes(8).toString('hex');

    // Insertion de l'utilisateur
    await pool.query(
      `INSERT INTO users (
        nom, prenom, email, mot_de_passe, nationalite,
        niveau_etudes, domaine_etudes, personne_a_prevenir,
        numero_tel, role
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        nom,
        prenom,
        email,
        hashedPassword,
        nationalite,
        niveau_etudes,
        domaine_etudes,
        personne_a_prevenir,
        numero_tel,
        role,
        tokenVersion
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
      // Récupération sécurisée de l'utilisateur
      const result = await pool.query(
        'SELECT id, nom, email, mot_de_passe, role, token_version FROM users WHERE email = $1',
        [email]
      );

      const user = result.rows[0];
      
      // Vérification générique pour éviter les attaques par timing
      if (!user || !(await bcrypt.compare(mot_de_passe, user.mot_de_passe))) {
        return res.status(401).json({
          error: 'Identifiants incorrects',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Génération des tokens
      const accessToken = authService.generateAccessToken(user);
      const refreshToken = authService.generateRefreshToken(user);

      // Réponse sécurisée
      res
        .cookie('refreshToken', refreshToken, jwtConfig.cookieOptions)
        .json({
          success: true,
          data: {
            accessToken,
            refreshToken,
            user: {
              id: user.id,
              nom: user.nom,
              email: user.email,
              role: user.role
            }
          }
        });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        error: 'Échec de l\'authentification',
        code: 'AUTH_FAILED' 
      });
    }
};

exports.revokeTokens = async (req, res) => {
    try {
      const newVersion = authService.generateTokenVersion();
      
      await pool.query(
        'UPDATE users SET token_version = $1 WHERE id = $2',
        [newVersion, req.user.id]
      );

      res.clearCookie('refreshToken').json({
        success: true,
        message: 'Sécurité renouvelée. Veuillez vous reconnecter.'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Échec de la révocation',
        code: 'REVOCATION_FAILED',
      });
    }
};

  /**
 * Rafraîchissement du token d'accès
 */
exports.refreshToken = async (req, res) => {
  const { refresh_token } = req.body || req.cookies.refreshToken;

  if (!refresh_token) {
    return res.status(400).json({
      error: "Refresh token requis",
      code: "MISSING_REFRESH_TOKEN"
    });
  }

  try {
    // 1. Vérifier le refresh token
    const decoded = authService.verifyToken(refresh_token, true); // true indique que c'est un refresh token
    
    // 2. Vérifier que l'utilisateur existe toujours
    const userResult = await pool.query(
      'SELECT id, token_version FROM users WHERE id = $1',
      [decoded.userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: "Utilisateur introuvable",
        code: "USER_NOT_FOUND"
      });
    }

    const user = userResult.rows[0];

    // 3. Vérifier la version du token (pour invalidation globale)
    if (decoded.tokenVersion !== user.token_version) {
      return res.status(401).json({
        error: "Session expirée",
        code: "TOKEN_REVOKED"
      });
    }

    // 4. Générer un nouveau token d'accès
    const newAccessToken = authService.generateAccessToken({
      id: user.id,
      role: decoded.role,
      token_version: user.token_version
    });

    // 5. Réponse
    res.json({
      success: true,
      accessToken: newAccessToken,
      // Optionnel : nouveau refresh token (rotation)
      refreshToken: authService.generateRefreshToken(user)
    });

  } catch (error) {
    console.error("Refresh token error:", error.message);

    // Détection spécifique des erreurs JWT
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Refresh token expiré",
        code: "REFRESH_TOKEN_EXPIRED",
        action: "relogin" // Nécessite une nouvelle connexion
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Refresh token invalide",
        code: "INVALID_REFRESH_TOKEN"
      });
    }

    res.status(500).json({
      error: "Erreur lors du rafraîchissement du token",
      code: "REFRESH_FAILED"
    });
  }
};
