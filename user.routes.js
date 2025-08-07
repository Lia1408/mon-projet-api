const express = require('express');
const router = express.Router();
const userController = require('./user.controller');// j'ai modifié le chemin pour les tests   
const authMiddleware = require('./auth.middleware');

// Route POST pour l'inscription
router.post('/register', userController.registerUser);

// Route POST pour la connexion
router.post('/login', userController.loginUser);

// POST - Rafraîchir le token d'accès
router.post('/refresh-token',
    authMiddleware.authenticate,
    userController.refreshToken);

// POST - Révoquer tous les tokens (nécessite authentification)
router.post('/revoke-tokens',
  authMiddleware.authenticate, 
  userController.revokeTokens
);

module.exports = router;
