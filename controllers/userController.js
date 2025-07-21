const User = require('../models/User');
const { validateInput } = require('../utils/validation');

// Simulation d'une base de données (en attendant une vraie DB)
// Données de test (à supprimer plus tard)
let users = [
  {
    name: "John Doe",
    email: "john@test.com",
    password: "password123",
    createdAt: new Date()
  },
  {
    name: "Jane Smith", 
    email: "jane@test.com",
    password: "motdepasse456",
    createdAt: new Date()
  },
  {
    name: "Ahmed El Fassi",
    email: "ahmed@test.ma",
    password: "testpass789",
    createdAt: new Date()
  }
];

// Contrôleur pour l'inscription
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    // Validation des données
    User.validate({ name, email, password });
    
    // Vérifier si l'utilisateur existe déjà
    const userExists = users.find(user => user.email === email);
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: "Email déjà utilisé" 
      });
    }
    
    // Créer un nouvel utilisateur
    const newUser = new User(name.trim(), email.toLowerCase(), password);
    users.push(newUser);
    
    res.status(201).json({ 
      success: true,
      message: "Inscription réussie",
      user: { name: newUser.name, email: newUser.email }
    });
    
  } catch (error) {
    next(error);
  }
};

// Contrôleur pour la connexion
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validation basique
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email et mot de passe requis"
      });
    }
    
    // Rechercher l'utilisateur
    const user = users.find(user => 
      user.email === email.toLowerCase() && user.password === password
    );
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Identifiants incorrects" 
      });
    }
    
    res.status(200).json({ 
      success: true,
      message: `Bienvenue ${user.name} !`,
      user: { name: user.name, email: user.email }
    });
    
  } catch (error) {
    next(error);
  }
};

// Contrôleur pour lister les utilisateurs (bonus)
const getAllUsers = async (req, res, next) => {
  try {
    const publicUsers = users.map(user => ({
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    }));
    
    res.status(200).json({
      success: true,
      users: publicUsers,
      count: publicUsers.length
    });
    
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getAllUsers
};

