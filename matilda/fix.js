const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/} else {\n\s*const distPath = path.join\(process.cwd\(\), 'dist'\);\n\s*app.use\(express.static\(distPath\)\);\n\s*app.get\('\*', \(req, res\) => {\n\s*res.sendFile\(path.join\(distPath, 'index.html'\)\);\n\s*}\);\n\s*}\n\n\s*app.listen\(PORT, "0.0.0.0", \(\) => {\n\s*console.log\(`Server running on http:\/\/localhost:\${PORT}`\);\n\s*}\);\n}\nmountVite\(\);/g, `} else {
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
