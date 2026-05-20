const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'gaelworx-agency' });
});

// API: Get agent list
app.get('/api/agents', (req, res) => {
  const agentsDir = path.join(__dirname, 'agents');
  const agents = [];
  if (fs.existsSync(agentsDir)) {
    const dirs = fs.readdirSync(agentsDir);
    dirs.forEach(dir => {
      const soulPath = path.join(agentsDir, dir, 'SOUL.md');
      if (fs.existsSync(soulPath)) {
        agents.push({ id: dir, name: dir.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) });
      }
    });
  }
  res.json(agents);
});

// API: Get workspace status
app.get('/api/status', (req, res) => {
  const statusPath = path.join(__dirname, 'STATUS.md');
  if (fs.existsSync(statusPath)) {
    res.type('text/markdown').send(fs.readFileSync(statusPath, 'utf8'));
  } else {
    res.json({ status: 'GAELWORX Agency - Running' });
  }
});

// API: Get thesis
app.get('/api/thesis', (req, res) => {
  const thesisPath = path.join(__dirname, 'workspace', 'THESIS.md');
  if (fs.existsSync(thesisPath)) {
    res.type('text/markdown').send(fs.readFileSync(thesisPath, 'utf8'));
  } else {
    res.status(404).json({ error: 'Thesis not found' });
  }
});

// Serve index
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GAELWORX Agency</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #e0e0e0; min-height: 100vh; }
    .container { max-width: 900px; margin: 0 auto; padding: 2rem; }
    h1 { font-size: 2.5rem; margin-bottom: 0.5rem; background: linear-gradient(135deg, #00ff88, #00aaff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .subtitle { color: #888; margin-bottom: 2rem; }
    .card { background: #141414; border: 1px solid #222; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; }
    .card h2 { color: #00ff88; margin-bottom: 0.5rem; }
    .card p { color: #aaa; line-height: 1.6; }
    .status { display: inline-block; background: #00ff8822; color: #00ff88; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem; }
    .agents { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem; }
    .agent { background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 1rem; }
    .agent h3 { color: #00aaff; font-size: 1rem; }
    a { color: #00aaff; }
  </style>
</head>
<body>
  <div class="container">
    <h1>GAELWORX Agency</h1>
    <p class="subtitle">AI Agent Team for Revenue Generation <span class="status">● Live</span></p>
    
    <div class="card">
      <h2>Mission</h2>
      <p>Build and operate AI agent teams that generate revenue through content, automation, and intelligence services.</p>
    </div>
    
    <div class="card">
      <h2>Agents</h2>
      <div class="agents" id="agents">Loading...</div>
    </div>
    
    <div class="card">
      <h2>API</h2>
      <p><a href="/health">/health</a> — Health check</p>
      <p><a href="/api/agents">/api/agents</a> — Agent list</p>
      <p><a href="/api/thesis">/api/thesis</a> — Business thesis</p>
      <p><a href="/api/status">/api/status</a> — Full status</p>
    </div>
  </div>
  
  <script>
    fetch('/api/agents').then(r => r.json()).then(agents => {
      document.getElementById('agents').innerHTML = agents.map(a => 
        '<div class="agent"><h3>' + a.name + '</h3></div>'
      ).join('') || '<p style="color:#666">No agents configured yet</p>';
    });
  </script>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`GAELWORX Agency running on port ${PORT}`);
});
