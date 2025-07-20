const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

let users = [];

app.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  const userExists = users.find(user => user.email === email);
  if (userExists) {
    return res.status(400).json({ message: "Email déjà utilisé" });
  }

  users.push({ name, email, password });
  res.status(201).json({ message: "Inscription réussie" });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = users.find(user => user.email === email && user.password === password);
  if (!user) {
    return res.status(401).json({ message: "Identifiants incorrects" });
  }

  res.status(200).json({ message: `Bienvenue ${user.name} !` });
});

app.listen(port, () => {
  console.log(`API démarrée sur http://localhost:${port}`);
});