const express = require('express');
const path = require('path');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 3000;

const tokenStore = {};

// Define hidden server sources
const servers = {
  S1: id => `https://vidzee.wtf/movie/${id}`,
  S2: id => `https://letsembed.cc/embed/movie/?id=${id}`,
  S3: id => `https://player.autoembed.cc/embed/movie/${id}?autoplay=true`,
  S4: id => `https://www.vidstream.site/embed/movie/${id}`,
  S5: id => `https://vidfast.pro/movie/${id}?autoPlay=true`,
  S6: id => `https://player.smashystream.com/movie/${id}`,
  S7: id => `https://111movies.com/movie/${id}`,
  S8: id => `https://vidjoy.pro/embed/movie/${id}?adFree=true`,
  S9: id => `https://www.vidsrc.wtf/api/1/movie/?id=${id}`,
  S10: id => `https://www.vidsrc.wtf/api/3/movie/?id=${id}`,
  S11: id => `https://vidlink.pro/movie/${id}?autoplay=true&title=true`,
  S12: id => `https://embed.su/embed/movie/${id}`
};

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Generate token and redirect
app.get('/play/:id', (req, res) => {
  const id = req.params.id;
  const token = crypto.randomBytes(16).toString('hex');
  tokenStore[token] = { id, expires: Date.now() + 60000 };
  res.redirect(`/watch?token=${token}`);
});

// Serve player UI
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
      <title>Stream Player</title>
      <style>
        body, html { margin: 0; padding: 0; height: 100%; background: #111; color: white; }
        iframe { width: 100vw; height: 100vh; border: none; }
        select {
          position: fixed;
          top: 12px;
          right: 12px;
          z-index: 9999;
          padding: 8px 12px;
          border: none;
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(10px);
          color: #fff;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <select id="serverPicker">
        ${Object.keys(servers).map(k => `<option value="${k}">${k}</option>`).join('')}
      </select>
      <div id="player"></div>
      <script>
        const id = "${id}";
        const picker = document.getElementById('serverPicker');
        const player = document.getElementById('player');

        function load(server) {
          const iframe = document.createElement('iframe');
          iframe.src = "/load/" + server + "/" + id;
          iframe.allowFullscreen = true;
          player.innerHTML = '';
          player.appendChild(iframe);
        }

        picker.addEventListener('change', () => load(picker.value));
        load("S1"); // Default load

        // Anti-inspect
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.onkeydown = e => {
          if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key.toUpperCase())) || (e.ctrlKey && e.key.toLowerCase() === 'u')) {
            location.reload();
            return false;
          }
        };
      </script>
    </body>
    </html>
  `);
});

// Stream redirect (secure path)
app.get('/load/:server/:id', (req, res) => {
  const { server, id } = req.params;
  if (!servers[server]) return res.status(404).send('Invalid server');
  res.redirect(servers[server](id));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
