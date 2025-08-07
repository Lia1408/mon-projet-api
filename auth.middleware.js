// auth.middleware.js
const jwt = require('jsonwebtoken');
const pool = require('./db');
const authService = require('./services/jwt.service'); // Importez votre service
const { jwt: jwtConfig } = require('./config/jwt.config');

exports.authenticate = async (req, res, next) => {
  // 1. Récupérer le token depuis le header
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      error: "Token manquant",
      code: "MISSING_TOKEN"
    });
  }

  try {
    // 2. Utilisez AuthService pour vérifier le token
    const decoded = authService.verifyToken(token); // Pas besoin de isRefresh ici
    
    // 3. Vérifier l'utilisateur en base
    const userResult = await pool.query(
      'SELECT token_version FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: "Utilisateur introuvable",
        code: "USER_NOT_FOUND"
      });
    }

    // 4. Vérifier la version du token (revocation check)
    if (decoded.tokenVersion !== userResult.rows[0].token_version) {
      return res.status(401).json({
        error: "Session expirée",
        code: "TOKEN_REVOKED"
      });
    }

    // 5. Attacher les infos utilisateur à la requête
    req.user = {
      id: decoded.userId,
      role: decoded.role,
      tokenVersion: decoded.tokenVersion
    };

    next(); // Passer au prochain middleware/controller

  } catch (error) {
    // Gestion des erreurs JWT (utilisez les mêmes codes que dans AuthService)
    const statusCode = error.message.includes('expiré') ? 401 : 403;
    res.status(statusCode).json({
      error: error.message,
      code: error.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
    });
  }
};