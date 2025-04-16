const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.post('/watch', (req, res) => {
  const id = req.body.movieId?.trim();
  if (!id) return res.redirect('/');
  res.send(`
    <html>
      <head>
        <title>Embedded Player</title>
        <style>
          body { margin: 0; padding: 0; background: #000; }
          iframe { width: 100vw; height: 100vh; border: none; }
        </style>
      </head>
      <body>
        <iframe src="https://vidzee.wtf/movie/${id}" allowfullscreen></iframe>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
