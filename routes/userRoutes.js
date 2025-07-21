const express = require('express');
const { register, login, getAllUsers } = require('../controllers/userController');

const router = express.Router();

// Route d'inscription
router.post('/register', register);

// Route de connexion
router.post('/login', login);

// Route pour lister les utilisateurs (bonus)
router.get('/users', getAllUsers);

module.exports = router;