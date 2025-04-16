const express = require('express');
const path = require('path');
const crypto = require('crypto');
const app = express();
const PORT = 3000;

// Token store (simple in-memory object)
const tokenStore = {};

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Serve the form page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Handle form submission
app.post('/get', (req, res) => {
  const id = req.body.id;
  if (!id) return res.send('No ID provided');

  const token = crypto.randomBytes(16).toString('hex');
  tokenStore[token] = { id, expires: Date.now() + 60000 };

  res.redirect(`/watch?token=${token}`);
});

// Watch page
app.get('/watch', (req, res) => {
  const token = req.query.token;
  const entry = tokenStore[token];

  if (!entry || Date.now() > entry.expires) {
    return res.send('Invalid or expired token.');
  }

  const id = entry.id;

  res.send(`
    <html>
    <head>
      <title>Secure Player</title>
      <style>
        body, html { margin: 0; padding: 0; height: 100%; background: black; }
      </style>
    </head>
    <body>
      <div id="container"></div>
      <script>
        document.addEventListener('DOMContentLoaded', () => {
          const iframe = document.createElement('iframe');
          iframe.src = "/stream/${id}";
          iframe.style = "width:100vw;height:100vh;border:none;";
          iframe.allowFullscreen = true;
          iframe.sandbox = "allow-scripts allow-same-origin";
          document.getElementById('container').appendChild(iframe);
        });

        // Anti-inspect
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.onkeydown = e => {
          if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && ['I','C','J'].includes(e.key.toUpperCase())) || (e.ctrlKey && e.key === 'u')) {
            location.reload();
            return false;
          }
        };
      </script>
    </body>
    </html>
  `);
});

// Proxy route (protect actual URL)
app.get('/stream/:id', (req, res) => {
  const id = req.params.id;
  res.redirect(`https://vidzee.wtf/movie/${id}`);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
