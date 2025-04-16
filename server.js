const express = require('express');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios'); // For making HTTP requests to external APIs
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
  const server = req.body.server || 'vidzee'; // Default to vidzee.wtf if no server is selected
  if (!id) return res.send('No ID provided');

  const token = crypto.randomBytes(16).toString('hex');
  tokenStore[token] = { id, server, expires: Date.now() + 60000 };

  res.redirect(`/watch?token=${token}`);
});

// Watch route with iframe loaded by JavaScript (hides URL)
app.get('/watch', (req, res) => {
  const token = req.query.token;
  const entry = tokenStore[token];

  if (!entry || Date.now() > entry.expires) {
    return res.send('Invalid or expired token.');
  }

  const { id, server } = entry;
  const apiUrl = server === 'letsembed'
    ? `https://Letsembed.cc/embed/movie/?id=${id}`
    : `https://vidzee.wtf/movie/${id}`;

  // Fetch the video page from the external API
  axios.get(apiUrl)
    .then(response => {
      const iframeSrc = apiUrl; // This would be the URL of the iframe (API response)
      
      // Send the HTML with iframe embedded via JS
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Secure Player</title>
          <style>
            html, body { margin: 0; height: 100%; background: #000; overflow: hidden; }
            iframe { display: block; width: 100vw; height: 100vh; border: none; }
            #spinner { position: fixed; top: 10px; right: 10px; z-index: 1000; }
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
            iframe.src = "${iframeSrc}"; // Use the proxy URL for the video
            iframe.allowFullscreen = true;
            iframe.sandbox = "allow-scripts allow-same-origin";
            document.getElementById("player").appendChild(iframe);
          </script>
          
          <!-- Spinner (if switching servers) -->
          <div id="spinner" style="display:none;">Loading...</div>
          
          <script>
            // Handle server switching (if needed)
            const spinner = document.getElementById("spinner");
            const iframe = document.querySelector("iframe");
            
            // Show spinner while the iframe is loading
            iframe.onload = function() {
              spinner.style.display = "none";
            };
            
            // Show spinner when loading starts
            spinner.style.display = "block";
          </script>
        </body>
        </html>
      `);
    })
    .catch(err => {
      res.send('Error fetching video.');
    });
});

// Proxy route for vidzee.wtf
app.get('/stream/:id', (req, res) => {
  const id = req.params.id;
  res.redirect(`https://vidzee.wtf/movie/${id}`);
});

// Proxy route for Letsembed.cc
app.get('/stream-letsembed/:id', (req, res) => {
  const id = req.params.id;
  res.redirect(`https://Letsembed.cc/embed/movie/?id=${id}`);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
