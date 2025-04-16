const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();

// Proxy middleware to hide the Vidzee URL
app.use('/stream', createProxyMiddleware({
  target: 'https://vidzee.wtf',
  changeOrigin: true,
  pathRewrite: {
    '^/stream': '', // Rewriting /stream to /movie/{id}
  },
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('Referer', 'https://vidzee.wtf');
  }
}));

// Route for video watch page
app.get('/watch', (req, res) => {
  const movieId = req.query.id;
  if (!movieId) {
    return res.send('Error: No Movie ID provided');
  }

  // Serve the embedded player with the movie
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Watch Movie</title></head>
    <body>
      <iframe src="/stream/movie/${movieId}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
