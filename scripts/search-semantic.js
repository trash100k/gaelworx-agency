const { create, insert, search } = require('@orama/orama');
const { pipeline } = require('@xenova/transformers');
const fs = require('fs');
const path = require('path');

let embedder = null;

async function getEmbedder() {
  if (!embedder) {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { quantized: true });
  }
  return embedder;
}

async function embed(text) {
  const ext = await getEmbedder();
  const output = await ext(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

async function buildIndex() {
  console.log('Building semantic search index...');

  const db = await create({
    schema: {
      title: 'string',
      content: 'string',
      category: 'string',
      source: 'string',
      embedding: 'vector[384]',
    },
  });

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
  ];

  let total = 0;
  for (const src of sources) {
    if (!fs.existsSync(src.file)) continue;
    const content = fs.readFileSync(src.file, 'utf-8');
    const chunks = content.split(/\n#{1,3}\s+/).filter(c => c.trim().length > 30);

    for (const chunk of chunks) {
      const title = chunk.split('\n')[0].trim().substring(0, 120);
      const textToEmbed = title + ' ' + chunk.substring(0, 500);
      const embeddingVector = await embed(textToEmbed);

      await insert(db, {
        title,
        content: chunk.substring(0, 3000),
        category: src.category,
        source: path.basename(src.file),
        embedding: embeddingVector,
      });
      total++;
      if (total % 20 === 0) process.stdout.write(`\r  Indexed ${total} docs...`);
    }
  }

  console.log(`\r  Indexed ${total} docs total`);
  return db;
}

async function semanticQuery(db, q, limit = 5) {
  const qEmbedding = await embed(q);
  const results = await search(db, {
    mode: 'vector',
    vector: { value: qEmbedding, property: 'embedding' },
    similarity: 0.5,
    includeVectors: false,
    limit,
  });
  return results;
}

// CLI
if (require.main === module) {
  const query = process.argv.slice(2).join(' ');
  if (!query) { console.log('Usage: node search-semantic.js "your query"'); process.exit(1); }

  buildIndex().then(db => semanticQuery(db, query)).then(r => {
    console.log(`\n🔎 "${query}" => ${r.count} results (vector search)\n`);
    r.hits.forEach((h, i) => {
      console.log(`${i + 1}. [${h.document.category}] ${h.document.title}`);
      console.log(`   Source: ${h.document.source} | Similarity: ${(h.score * 100).toFixed(1)}%`);
      const preview = h.document.content.substring(0, 150).replace(/\n/g, ' ');
      console.log(`   ${preview}...`);
      console.log();
    });
  }).catch(console.error);
}

module.exports = { buildIndex, semanticQuery, embed };
