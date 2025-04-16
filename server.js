const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/enjoy/:id', (req, res) => {
  const id = req.params.id;
  const server = req.query.server === 'S2' ? 'S2' : 'S1';

  const source = server === 'S1'
    ? `https://vidzee.wtf/movie/${id}`
    : `https://letsembed.cc/embed/movie/?id=${id}`;

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Embed Player</title>
      <style>
        body {
          margin: 0;
          height: 100vh;
          background: #0f0f0f;
          font-family: sans-serif;
          overflow: hidden;
        }
        .glass {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 10px;
          backdrop-filter: blur(10px);
          z-index: 999;
        }
        .glass select {
          background: transparent;
          color: white;
          border: none;
          outline: none;
          font-size: 16px;
        }
        iframe {
          width: 100vw;
          height: 100vh;
          border: none;
        }
      </style>
    </head>
    <body>
      <div class="glass">
        <form method="GET" action="/enjoy/${id}">
          <select name="server" onchange="this.form.submit()">
            <option value="S1" ${server === 'S1' ? 'selected' : ''}>S1</option>
            <option value="S2" ${server === 'S2' ? 'selected' : ''}>S2</option>
          </select>
        </form>
      </div>
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

        // Dynamically inject iframe
        const iframe = document.createElement('iframe');
        iframe.src = '${source}';
        iframe.allowFullscreen = true;
        iframe.sandbox = "allow-scripts allow-same-origin";
        document.getElementById("player").appendChild(iframe);
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});

