const express = require('express');
const path = require('path');
const crypto = require('crypto');
const app = express();
const PORT = 3000;

const tokenStore = {};

const serverList = {
  S1: id => `https://vidzee.wtf/movie/${id}`,
  S2: id => `https://letsembed.cc/embed/movie/?id=${id}`,
  S3: id => `https://player.autoembed.cc/embed/movie/${id}?autoplay=true`,
  S4: id => `https://www.vidstream.site/embed/movie/${id}`,
  S5: id => `https://vidfast.pro/movie/${id}?autoPlay=true`,
  S6: id => `https://player.smashystream.com/movie/${id}`,
  S7: id => `https://111movies.com/movie/${id}`,
  S8: id => `https://vidjoy.pro/embed/movie/${id}?adFree=true`,
  S9: id => `https://www.vidsrc.wtf/api/1/movie/?id=${id}`,
  S10: id => `https://vidlink.pro/movie/${id}?autoplay=true&title=true`,
  S11: id => `https://embed.su/embed/movie/${id}`,
};

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.post('/get', (req, res) => {
  const id = req.body.id;
  const server = req.body.server;
  if (!id || !server || !serverList[server]) return res.send('Invalid input');

  const token = crypto.randomBytes(16).toString('hex');
  tokenStore[token] = { id, server, expires: Date.now() + 60000 };
  res.redirect(`/watch?token=${token}`);
});

app.get('/watch', (req, res) => {
  const token = req.query.token;
  const entry = tokenStore[token];
  if (!entry || Date.now() > entry.expires) return res.send('Invalid or expired token');

  const videoUrl = `/stream/${entry.server}/${entry.id}`;
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Secure Player</title>
      <style>
        body { margin: 0; background: #000; }
        iframe { width: 100vw; height: 100vh; border: none; }
      </style>
    </head>
    <body>
      <div id="player"></div>
      <script>
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.onkeydown = e => {
          if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key.toUpperCase())) || (e.ctrlKey && e.key.toLowerCase() === 'u')) {
            location.reload();
            return false;
          }
        };
        const iframe = document.createElement('iframe');
        iframe.src = "${videoUrl}";
        iframe.allowFullscreen = true;
        iframe.sandbox = "allow-same-origin allow-scripts";
        document.getElementById("player").appendChild(iframe);
      </script>
    </body>
    </html>
  `);
});

app.get('/stream/:server/:id', (req, res) => {
  const { server, id } = req.params;
  if (!serverList[server]) return res.send('Invalid server');
  res.redirect(serverList[server](id));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
