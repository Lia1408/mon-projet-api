// routes/user.routes.js

const express = require('express');
const router = express.Router();
const userController = require('./user.controller');// j'ai modifié le chemin pour les tests   

// Route POST pour l'inscription
router.post('/register', userController.registerUser);

// Route POST pour la connexion
router.post('/login', userController.loginUser);

module.exports = router;