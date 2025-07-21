// Middleware global de gestion d'erreurs

const errorHandler = (err, req, res, next) => {
  console.error('Erreur:', err.message);
  console.error('Stack:', err.stack);
  
  // Erreurs de validation
  if (err.message.includes('invalide') || err.message.includes('requis') || err.message.includes('caractères')) {
    return res.status(400).json({
      success: false,
      message: err.message,
      type: 'ValidationError'
    });
  }
  
  // Erreurs de parsing JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Format JSON invalide',
      type: 'SyntaxError'
    });
  }
  
  // Erreur générique serveur
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    type: 'ServerError'
  });
};

module.exports = errorHandler;