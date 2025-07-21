// Modèle de données pour les utilisateurs
class User {
  constructor(name, email, password) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.createdAt = new Date();
  }

  // Méthode statique pour valider les données utilisateur
  static validate(userData) {
    const { name, email, password } = userData;
    
    if (!name || name.trim().length < 2) {
      throw new Error('Le nom doit contenir au moins 2 caractères');
    }
    
    if (!email || !this.isValidEmail(email)) {
      throw new Error('Email invalide');
    }
    
    if (!password || password.length < 6) {
      throw new Error('Le mot de passe doit contenir au moins 6 caractères');
    }
    
    return true;
  }

  // Vérification du format email
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

module.exports = User;