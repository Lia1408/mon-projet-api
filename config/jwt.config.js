const crypto = require('crypto');

// Vérification que la clé secrète est bien définie
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined in environment variables');
}

module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET,
    algorithms: ['HS512'], // Algorithme asymétrique recommandé
    accessExpiration: '15m',  // Durée courte pour limiter la fenêtre d'attaque
    refreshExpiration: '7d',  // Durée plus longue mais nécessite un secret différent
    issuer: 'CESAM',
    audience: 'mobile-app',
    refreshSecret: process.env.JWT_SECRET + crypto.randomBytes(16).toString('hex') // Secret différent pour refresh
  },
  cookieOptions: {
    httpOnly: true, // Empêche l'accès via JavaScript
    secure: process.env.NODE_ENV === 'production', // HTTPS seulement en prod
    sameSite: 'Strict', // Protection contre les attaques CSRF
    domain: process.env.COOKIE_DOMAIN || 'localhost',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours en ms
  }
};
