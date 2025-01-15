require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const validUrl = require('valid-url'); // Validation améliorée des URL
const app = express();
const shorturls = ['https://freecodecamp.org'];

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.json()); // Pour analyser le JSON
app.use(express.urlencoded({ extended: true })); // Pour analyser les données encodées en URL

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// API endpoint pour accéder à une URL raccourcie
app.get('/api/shorturl/:id', (req, res) => {
  const id = parseInt(req.params.id, 10); // Convertit l'id en entier
  if (id >= 0 && id < shorturls.length) {
    res.redirect(shorturls[id]); // Redirige vers l'URL originale
  } else {
    res.json({ error: 'No short URL found for the given input' }); // Erreur si l'id est invalide
  }
});

// API endpoint pour raccourcir une URL
app.post('/api/shorturl', (req, res) => {
  const url = req.body.url;

  // Validation de l'URL avec la bibliothèque `valid-url`
  if (!validUrl.isWebUri(url)) {
    return res.json({ error: 'invalid url' });
  }

  try {
    // Extraction du domaine de l'URL
    const domain = new URL(url).hostname;

    // Vérification DNS pour s'assurer que le domaine existe
    dns.lookup(domain, (err) => {
      if (err) {
        console.error('DNS lookup error:', err.message); // Debugging des erreurs
        return res.json({ error: 'invalid url' });
      }

      // Ajoute l'URL à la liste et retourne le nouvel ID
      const id = shorturls.length;
      shorturls.push(url);
      res.json({ original_url: url, short_url: id });
    });
  } catch (e) {
    console.error('URL parsing error:', e.message); // Debugging des erreurs
    res.json({ error: 'invalid url' });
  }
});

// Écoute sur le port spécifié
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
