res.send(`
  <html>
    <head>
      <title>Secure Player</title>
      <style>
        html, body { margin:0; padding:0; height:100%; overflow:hidden; background:#000; }
        #player { width:100%; height:100%; border:none; }
      </style>
    </head>
    <body>
      <div id="container"></div>

      <script>
        document.addEventListener('DOMContentLoaded', () => {
          const enc = '${encrypted}';
          const iframe = document.createElement('iframe');
          iframe.src = '/stream/' + enc;
          iframe.allowFullscreen = true;
          iframe.sandbox = 'allow-scripts allow-same-origin allow-popups';
          iframe.id = 'player';
          document.getElementById('container').appendChild(iframe);
        });

        // Anti-inspect
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
