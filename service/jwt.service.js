const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/jwt.config');
const crypto = require('crypto');

class AuthService {
  /**
   * Génère un token d'accès avec metadata de sécurité
   * @param {Object} user - L'utilisateur authentifié
   * @returns {String} Token JWT signé
   */
  generateAccessToken(user) {
    const payload = {
      userId: user.id, // Standard JWT pour le sujet
      role: user.role,
      tokenVersion: user.token_version, // Pour invalidation ciblée
      iat: Math.floor(Date.now() / 1000) // Timestamp d'émission
    };

    return jwt.sign(payload, jwtConfig.secret, {
      algorithm: jwtConfig.algorithms[0],
      expiresIn: jwtConfig.accessExpiration,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
      jwtid: crypto.randomBytes(8).toString('hex') // ID unique pour le token
    });
  }

  /**
   * Génère un token de rafraîchissement avec secret différent
   * @param {Object} user - L'utilisateur authentifié
   * @returns {String} Refresh token JWT
   */
  generateRefreshToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        type: 'refresh', // Clarifie le type de token,
        tokenVersion: user.token_version,
      },
      jwtConfig.refreshSecret, // Utilise un secret différent
      {
        algorithm: jwtConfig.algorithms[0],
        expiresIn: jwtConfig.refreshExpiration,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      }
    );
  }

  /**
   * Vérifie et décode un token JWT
   * @param {String} token - Token à vérifier
   * @param {Boolean} isRefresh - Si c'est un refresh token
   * @returns {Object} Payload décodé
   * @throws {Error} Si le token est invalide
   */
  verifyToken(token, isRefresh = false) {
    try {
      return jwt.verify(token, isRefresh ? jwtConfig.refreshSecret : jwtConfig.secret, {
        algorithms: jwtConfig.algorithms,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
        clockTolerance: 30 // Marge de 30s pour les problèmes de synchronisation
      });
    } catch (err) {
      // Journalisation de l'erreur avant de la remonter
      console.error(`Token verification failed: ${err.message}`);
      throw new Error('Token invalide ou expiré');
    }
  }

  /**
   * Génère une version aléatoire pour invalidation
   * @returns {String} Version cryptographique aléatoire
   */
  generateTokenVersion() {
    return crypto.randomBytes(16).toString('hex'); // 128 bits d'entropie
  }
}

module.exports = new AuthService();
