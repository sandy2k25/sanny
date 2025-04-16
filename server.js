const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Form page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Secret proxy path (never exposed in frontend)
app.use('/stream', createProxyMiddleware({
  target: 'https://vidzee.wtf',
  changeOrigin: true,
  pathRewrite: (path) => {
    // Extract token from path, decrypt to get movie ID
    const token = path.split('/')[2];
    try {
      const buff = Buffer.from(token, 'base64');
      const id = buff.toString('utf-8');
      return `/movie/${id}`;
    } catch {
      return '/error';
    }
  },
  onProxyReq: (proxyReq) => {
    proxyReq.setHeader('Referer', 'https://vidzee.wtf');
  }
}));

// Watch page with encrypted iframe
app.get('/watch', (req, res) => {
  const id = req.query.id;
  if (!id) return res.send('Missing ID');

  const encrypted = Buffer.from(id).toString('base64'); // simple base64

  res.send(`
    <html>
      <head>
        <title>Secure Movie</title>
        <style>html,body{margin:0;height:100%;overflow:hidden;}</style>
      </head>
      <body>
        <iframe 
          src="/stream/${encrypted}" 
          width="100%" 
          height="100%" 
          frameborder="0" 
          allowfullscreen 
          sandbox="allow-scripts allow-same-origin allow-popups"
          style="border:0;width:100vw;height:100vh;position:fixed;top:0;left:0;">
        </iframe>

        <script>
          document.addEventListener('contextmenu', e => e.preventDefault());
          document.onkeydown = e => {
            if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(String.fromCharCode(e.keyCode)))) {
              location.reload();
              return false;
            }
          };
        </script>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(\`Server running at http://localhost:\${PORT}\`);
});
