const { create, insert, search } = require('@orama/orama');
const { pipeline } = require('@xenova/transformers');
const fs = require('fs');
const path = require('path');

let embedder = null;
async function getEmbedder() {
  if (!embedder) embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { quantized: true });
  return embedder;
}
async function embed(text) {
  const e = await getEmbedder();
  const o = await e(text.substring(0, 512), { pooling: 'mean', normalize: true });
  return Array.from(o.data);
}

const sources = [
  { file: '/root/cannabis-accessory-market-research.md', category: 'cannabis' },
  { file: '/root/parallel-research-report.md', category: 'cannabis' },
  { file: '/root/research/2026-05-12-agent-agency-social.md', category: 'agency' },
  { file: '/root/research/2026-05-12-web-safety-complete.md', category: 'security' },
  { file: '/root/research/2026-05-12-github-agents.md', category: 'agency' },
  { file: '/root/agency/workspace/THESIS.md', category: 'agency' },
  { file: '/root/agency/workspace/SIGNALS.md', category: 'intelligence' },
  { file: '/root/agency/workspace/FEEDBACK-LOG.md', category: 'lessons' },
  { file: '/root/revenue/STATUS.md', category: 'revenue' },
  { file: '/root/token-crunching-stack.md', category: 'tech' },
  { file: '/root/lean-agent-playbook.md', category: 'tech' },
  { file: '/root/notes/AGENT-WORKFLOW-RULES.md', category: 'workflow' },
  { file: '/root/agency/agents/orchestrator/SOUL.md', category: 'agent' },
  { file: '/root/agency/agents/content-creator/SOUL.md', category: 'agent' },
  { file: '/root/agency/agents/researcher/SOUL.md', category: 'agent' },
];

async function buildIndex() {
  const db = await create({
    schema: { title: 'string', content: 'string', category: 'string', source: 'string', embedding: 'vector[384]' },
  });

  let total = 0;
  for (const src of sources) {
    if (!fs.existsSync(src.file)) continue;
    const content = fs.readFileSync(src.file, 'utf-8');
    const chunks = content.split(/\n#{1,3}\s+/).filter(c => c.trim().length > 30);
    for (const chunk of chunks) {
      const title = chunk.split('\n')[0].trim().substring(0, 120);
      const emb = await embed(title + ' ' + chunk.substring(0, 400));
      await insert(db, { title, content: chunk.substring(0, 2500), category: src.category, source: path.basename(src.file), embedding: emb });
      total++;
    }
  }
  return { db, total };
}

async function query(q, limit = 5) {
  const { db, total } = await buildIndex();
  const qVec = await embed(q);

  // Try vector search first
  let results = await search(db, {
    mode: 'vector',
    vector: { value: qVec, property: 'embedding' },
    similarity: 0.25,
    limit,
  });

  // If vector returns few results, also do text search and merge
  if (results.count < 3) {
    const textResults = await search(db, {
      term: q,
      properties: ['title', 'content'],
      tolerance: 1,
      limit,
      boost: { title: 2 },
    });
    // Merge (vector results take priority)
    const seen = new Set(results.hits.map(h => h.document.title));
    for (const hit of textResults.hits) {
      if (!seen.has(hit.document.title) && results.hits.length < limit) {
        results.hits.push(hit);
      }
    }
  }

  return results;
}

// CLI
if (require.main === module) {
  const q = process.argv.slice(2).join(' ');
  if (!q) { console.log('Usage: node smart-search.js "your query"'); process.exit(1); }

  console.log(`\n🔎 "${q}"...\n`);
  query(q).then(r => {
    if (r.count === 0) {
      console.log('No results found. Try different keywords.');
    }
    r.hits.forEach((h, i) => {
      const score = h.score < 1 ? (h.score * 100).toFixed(1) + '%' : h.score.toFixed(1);
      console.log(`${i + 1}. [${h.document.category}] ${h.document.title}`);
      console.log(`   ${h.document.source} | Score: ${score}`);
      console.log(`   ${h.document.content.substring(0, 180).replace(/\n/g, ' ')}...`);
      console.log();
    });
  }).catch(console.error);
}

module.exports = { query, buildIndex };
