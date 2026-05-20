const { create, insert, search } = require('@orama/orama');
const fs = require('fs');
const path = require('path');

const DB_FILE = '/root/agency/data/knowledge-index.json';

async function buildFullIndex() {
  console.log('Building full knowledge index...');

  const db = await create({
    schema: {
      title: 'string',
      content: 'string',
      category: 'string',
      source: 'string',
    },
    components: { tokenizer: { stemming: true } },
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
    { file: '/root/agency/agents/orchestrator/SOUL.md', category: 'agent' },
    { file: '/root/agency/agents/content-creator/SOUL.md', category: 'agent' },
    { file: '/root/agency/agents/researcher/SOUL.md', category: 'agent' },
    { file: '/root/notes/AGENT-WORKFLOW-RULES.md', category: 'workflow' },
    { file: '/root/notes/IMPROVEMENTS.md', category: 'workflow' },
    { file: '/root/revenue/STATUS.md', category: 'revenue' },
    { file: '/root/token-crunching-stack.md', category: 'tech' },
    { file: '/root/lean-agent-playbook.md', category: 'tech' },
  ];

  let total = 0;
  for (const src of sources) {
    if (!fs.existsSync(src.file)) continue;
    const content = fs.readFileSync(src.file, 'utf-8');
    // Split into meaningful chunks (by headers or paragraphs)
    const chunks = content.split(/\n#{1,3}\s+/).filter(c => c.trim().length > 30);
    for (const chunk of chunks) {
      const title = chunk.split('\n')[0].trim().substring(0, 120);
      await insert(db, {
        title,
        content: chunk.substring(0, 3000),
        category: src.category,
        source: path.basename(src.file),
      });
      total++;
    }
  }

  // Save index metadata (document count, categories, sources)
  const meta = { totalDocs: total, sources: sources.length, built: new Date().toISOString() };
  fs.writeFileSync(DB_FILE, JSON.stringify(meta));
  console.log(`Indexed ${total} chunks from ${sources.length} files`);
  return db;
}

async function query(q, limit = 5) {
  // Rebuild index each time (fast for <200 docs)
  const db = await buildFullIndex();
  const results = await search(db, {
    term: q,
    properties: ['title', 'content'],
    tolerance: 1,
    limit,
    boost: { title: 2 },
  });
  return results;
}

// CLI usage: node search.js "your query"
if (require.main === module) {
  const queryText = process.argv.slice(2).join(' ');
  if (!queryText) {
    console.log('Usage: node search.js "your search query"');
    process.exit(1);
  }
  query(queryText).then(r => {
    console.log(`\nResults for: "${queryText}" (${r.count} found)\n`);
    r.hits.forEach((h, i) => {
      console.log(`${i + 1}. [${h.document.category}] ${h.document.title}`);
      console.log(`   Source: ${h.document.source} | Score: ${h.score.toFixed(2)}`);
      console.log(`   ${h.document.content.substring(0, 200)}...`);
      console.log();
    });
  });
}

module.exports = { query, buildFullIndex };
