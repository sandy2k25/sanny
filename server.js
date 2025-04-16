const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Serve the frontend static files
app.use(express.static(path.join(__dirname, 'public')));

// Proxy for vidzee.wtf
app.use('/stream', createProxyMiddleware({
  target: 'https://vidzee.wtf',
  changeOrigin: true,
  pathRewrite: {
    '^/stream': '', // /stream/movie/id => /movie/id
  },
  onProxyReq: (proxyReq, req, res) => {
    // Hide the original vidzee.wtf URL
    proxyReq.setHeader('Referer', 'https://vidzee.wtf');
  },
}));

// Route: /watch?id=tt1234567
app.get('/watch', (req, res) => {
  const id = req.query.id;
  if (!id) return res.send('No ID provided');

  // Send back an HTML page with the iframe
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Watch Movie</title>
      <style>
        html, body { margin: 0; height: 100%; overflow: hidden; }
        iframe { width: 100%; height: 100%; border: none; }
      </style>
    </head>
    <body>
      <iframe src="/stream/movie/${id}" allowfullscreen></iframe>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
