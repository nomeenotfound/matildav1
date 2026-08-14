const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/\} else \{\s*const distPath = path.join\(process.cwd\(\), 'dist'\);\s*app.use\(express.static\(distPath\)\);\s*app.get\('\*', \(req, res\) => \{\s*res.sendFile\(path.join\(distPath, 'index.html'\)\);\s*\}\);\s*\}\s*app.listen\(PORT, "0.0.0.0", \(\) => \{\s*console.log\(`Server running on http:\/\/localhost:\$\{PORT\}`\);\s*\}\);\s*\}\s*mountVite\(\);/, `} else {
    if (!process.env.VERCEL) {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(\`Server running on http://localhost:\${PORT}\`);
    });
  }
}
mountVite();

export default app;`);
fs.writeFileSync('server.ts', code);
