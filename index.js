require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware pour parser le JSON
app.use(cors());
app.use(express.json());

// Importer les routes
const userRoutes = require('./user.routes'); //j'ai modifié les chemins pour les tests 
app.use('/api/users', userRoutes);

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});