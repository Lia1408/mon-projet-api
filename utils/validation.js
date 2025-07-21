// Utilitaires de validation réutilisables

// Validation d'email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validation de mot de passe fort
const isStrongPassword = (password) => {
  // Au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
};

// Nettoyage des données d'entrée
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

// Validation générale des entrées
const validateInput = (data, rules) => {
  const errors = [];
  
  for (const field in rules) {
    const rule = rules[field];
    const value = data[field];
    
    if (rule.required && (!value || value.trim() === '')) {
      errors.push(`${field} est requis`);
    }
    
    if (rule.minLength && value && value.length < rule.minLength) {
      errors.push(`${field} doit contenir au moins ${rule.minLength} caractères`);
    }
    
    if (rule.email && value && !isValidEmail(value)) {
      errors.push(`${field} doit être un email valide`);
    }
  }
  
  return errors;
};

module.exports = {
  isValidEmail,
  isStrongPassword,
  sanitizeInput,
  validateInput
};