const express = require('express');
const path = require('path');
const crypto = require('crypto');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;

// In-memory token store (for demo; use Redis for production)
const tokenStore = {};

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Home page to enter ID
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Generate secure token and redirect to watch page
app.get('/get', (req, res) => {
  const id = req.query.id;
  if (!id) return res.send('Missing ID');

  const token = crypto.randomBytes(16).toString('hex');
  tokenStore[token] = { id, expires: Date.now() + 60000 }; // 60s validity

  res.redirect(`/watch?token=${token}`);
});

// Watch page that dynamically loads iframe
app.get('/watch', (req, res) => {
  const token = req.query.token;
  const data = tokenStore[token];

  if (!data || Date.now() > data.expires) {
    return res.send('Invalid or expired token.');
  }

  const encoded = Buffer.from(data.id).toString('base64');

  res.send(`
    <html>
      <head>
        <title>Secure Player</title>
        <style>
          html, body { margin: 0; padding: 0; height: 100%; background: #000; }
        </style>
      </head>
      <body>
        <div id="container"></div>
        <script>
          document.addEventListener('DOMContentLoaded', () => {
            const iframe = document.createElement('iframe');
            iframe.src = '/stream/${encoded}';
            iframe.style = 'border:none;width:100vw;height:100vh;position:fixed;top:0;left:0;';
            iframe.allowFullscreen = true;
            iframe.sandbox = 'allow-scripts allow-same-origin allow-popups';
            document.getElementById('container').appendChild(iframe);
          });

          // Anti-inspect
          const blockDevTools = () => {
            const el = new Image();
            Object.defineProperty(el, 'id', {
              get: function () {
                location.reload();
              }
            });
            console.log(el);
          };
          setInterval(blockDevTools, 1000);

          document.addEventListener('contextmenu', e => e.preventDefault());
          document.onkeydown = e => {
            if (
              e.keyCode === 123 ||
              (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(String.fromCharCode(e.keyCode))) ||
              (e.ctrlKey && e.keyCode === 'U'.charCodeAt(0))
            ) {
              location.reload();
              return false;
            }
          };
        </script>
      </body>
    </html>
  `);
});

// Proxy video stream
app.use('/stream', createProxyMiddleware({
  target: 'https://vidzee.wtf',
  changeOrigin: true,
  pathRewrite: (path) => {
    const encoded = path.split('/')[2];
    try {
      const id = Buffer.from(encoded, 'base64').toString('utf-8');
      return `/movie/${id}`;
    } catch {
      return '/invalid';
    }
  },
  onProxyReq: (proxyReq) => {
    proxyReq.setHeader('Referer', 'https://vidzee.wtf');
  }
}));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
