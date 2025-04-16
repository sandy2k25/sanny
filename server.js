const express = require('express');
const path = require('path');
const crypto = require('crypto');
const app = express();
const PORT = 3000;

// In-memory token store
const tokenStore = {};

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Direct access route: /watch/:id
app.get('/watch/:id', (req, res) => {
  const id = req.params.id;
  if (!id) return res.send('No ID provided');

  const token = crypto.randomBytes(16).toString('hex');
  tokenStore[token] = { id, expires: Date.now() + 60000 };
  res.redirect(`/watch?token=${token}`);
});

// Secure player with hidden iframe source
app.get('/watch', (req, res) => {
  const token = req.query.token;
  const entry = tokenStore[token];

  if (!entry || Date.now() > entry.expires) {
    return res.send('Invalid or expired token.');
  }

  const id = entry.id;

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Secure Player</title>
      <style>
        html, body { margin: 0; height: 100%; background: #000; overflow: hidden; }
        iframe { display: block; width: 100vw; height: 100vh; border: none; }
        #switcher { position: fixed; top: 10px; right: 10px; z-index: 99; }
      </style>
    </head>
    <body>
      <select id="switcher">
        <option value="vidzee" selected>Vidzee</option>
        <option value="letsembed">LetsEmbed</option>
      </select>
      <div id="player"></div>
      <script>
        // Prevent inspect
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.onkeydown = e => {
          if (
            e.keyCode === 123 || 
            (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key.toUpperCase())) || 
            (e.ctrlKey && e.key.toLowerCase() === 'u')
          ) {
            location.reload();
            return false;
          }
        };

        // Load iframe securely via JS
        function loadPlayer(source) {
          const iframe = document.createElement('iframe');
          iframe.allowFullscreen = true;
          iframe.sandbox = "allow-scripts allow-same-origin";
          iframe.src = "/stream/" + source + "/${id}";
          document.getElementById("player").innerHTML = '';
          document.getElementById("player").appendChild(iframe);
        }

        // Default load
        loadPlayer('vidzee');

        // Handle switching
        document.getElementById('switcher').addEventListener('change', function() {
          loadPlayer(this.value);
        });
      </script>
    </body>
    </html>
  `);
});

// Hidden redirect to stream URLs
app.get('/stream/:source/:id', (req, res) => {
  const { source, id } = req.params;
  if (source === 'vidzee') {
    res.redirect(`https://vidzee.wtf/movie/${id}`);
  } else if (source === 'letsembed') {
    res.redirect(`https://letsembed.cc/embed/movie/?id=${id}`);
  } else {
    res.status(404).send('Unknown source');
  }
});

app.listen(PORT, () => {
  console.log(`Secure player running at http://localhost:${PORT}`);
});

