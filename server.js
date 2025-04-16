const express = require('express');
const path = require('path');
const crypto = require('crypto');
const app = express();
const PORT = 3000;

// In-memory token store
const tokenStore = {};

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Serve the home page with input form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Handle form submission, generate token and redirect
app.post('/get', (req, res) => {
  const id = req.body.id;
  if (!id) return res.send('No ID provided');

  const token = crypto.randomBytes(16).toString('hex');
  tokenStore[token] = { id, expires: Date.now() + 60000 };

  res.redirect(`/watch?token=${token}`);
});

// Watch route with iframe loaded by JavaScript (hides URL)
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
      </style>
    </head>
    <body>
      <div id="player"></div>
      <script>
        // Anti-inspect
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.onkeydown = e => {
          if (
            e.keyCode == 123 || 
            (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key.toUpperCase())) || 
            (e.ctrlKey && e.key.toLowerCase() === 'u')
          ) {
            location.reload();
            return false;
          }
        };

        // Load iframe via JS (not in raw HTML)
        const iframe = document.createElement('iframe');
        iframe.src = "/stream/${id}";
        iframe.allowFullscreen = true;
        iframe.sandbox = "allow-scripts allow-same-origin";
        document.getElementById("player").appendChild(iframe);
      </script>
    </body>
    </html>
  `);
});

// Proxy route that hides real URL for Vidzee
app.get('/stream/:id', (req, res) => {
  const id = req.params.id;
  res.redirect(`https://vidzee.wtf/movie/${id}`);
});

// Proxy route for LetsEmbed (change 'letstream' to 'enjoy')
app.get('/enjoy/:id', (req, res) => {
  const id = req.params.id;
  res.redirect(`https://Letsembed.cc/embed/movie/?id=${id}`);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
