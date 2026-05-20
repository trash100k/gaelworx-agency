#!/usr/bin/env node
/**
 * Orama Semantic Search Index
 * Indexes all agency knowledge for natural language search
 */

const { create, insert, search } = require('@orama/orama');
const fs = require('fs');
const path = require('path');

const DATA_DIR = '/root/agency/data';
const DB_PATH = DATA_DIR + '/knowledge.db';

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

async function buildIndex() {
  console.log('🔍 Building Orama search index...');

  // Create the database schema
  const db = await create({
    schema: {
      title: 'string',
      content: 'string',
      category: 'string',
      source: 'string',
      date: 'string',
    },
    components: {
      tokenizer: {
        stemming: true,
        stopWords: ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or', 'because', 'until', 'while', 'although', 'though', 'after', 'before', 'that', 'this', 'these', 'those', 'what', 'which', 'who', 'whom', 'whose', 'where', 'when'],
      },
    },
  });

  // Knowledge sources to index
  const sources = [
    { file: '/root/cannabis-accessory-market-research.md', category: 'cannabis-market' },
    { file: '/root/parallel-research-report.md', category: 'cannabis-platform' },
    { file: '/root/research/INDEX.md', category: 'research-index' },
    { file: '/root/research/2026-05-12-agent-agency-social.md', category: 'agent-agency' },
    { file: '/root/research/2026-05-12-web-safety-complete.md', category: 'security' },
    { file: '/root/agency/workspace/THESIS.md', category: 'agency' },
    { file: '/root/agency/workspace/SIGNALS.md', category: 'intelligence' },
    { file: '/root/agency/workspace/FEEDBACK-LOG.md', category: 'lessons' },
    { file: '/root/agency/agents/orchestrator/SOUL.md', category: 'agent' },
    { file: '/root/agency/agents/content-creator/SOUL.md', category: 'agent' },
    { file: '/root/agency/agents/researcher/SOUL.md', category: 'agent' },
    { file: '/root/notes/AGENT-WORKFLOW-RULES.md', category: 'workflow' },
    { file: '/root/notes/IMPROVEMENTS.md', category: 'improvements' },
    { file: '/root/revenue/STATUS.md', category: 'revenue' },
  ];

  let totalDocs = 0;

  for (const source of sources) {
    if (!fs.existsSync(source.file)) {
      console.log(`  ⚠️  Skipping (not found): ${source.file}`);
      continue;
    }

    const content = fs.readFileSync(source.file, 'utf-8');
    
    // Split into sections by headers
    const sections = content.split(/^#{1,3}\s+/m).filter(s => s.trim().length > 50);
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim();
      const title = section.split('\n')[0].substring(0, 100);
      const body = section.substring(0, 2000); // Limit per section
      
      await insert(db, {
        title,
        content: body,
        category: source.category,
        source: path.basename(source.file),
        date: new Date().toISOString().split('T')[0],
      });
      totalDocs++;
    }

    console.log(`  ✅ ${path.basename(source.file)}: ${sections.length} sections indexed`);
  }

  // Persist the database
  const serialized = await db.export();
  fs.writeFileSync(DB_PATH, JSON.stringify(serialized));

  console.log(`\n📊 Index complete: ${totalDocs} documents from ${sources.length} sources`);
  console.log(`💾 Saved to: ${DB_PATH}`);
  console.log(`📦 Size: ${(fs.statSync(DB_PATH).size / 1024).toFixed(1)} KB`);

  return db;
}

async function testSearch(db) {
  console.log('\n🧪 Testing search...\n');

  const queries = [
    'cannabis accessories market',
    'agent agency revenue',
    'browser fingerprinting security',
    'social media content',
    'buying signals B2B',
  ];

  for (const query of queries) {
    const results = await search(db, {
      term: query,
      properties: ['title', 'content'],
      limit: 3,
      threshold: 0.1,
    });

    console.log(`🔎 "${query}" → ${results.count} results`);
    for (const hit of results.hits.slice(0, 2)) {
      console.log(`   [${hit.document.category}] ${hit.document.title.substring(0, 60)}...`);
    }
    console.log();
  }
}

async function main() {
  const db = await buildIndex();
  await testSearch(db);
  console.log('✅ Orama semantic search is ready!');
}

main().catch(console.error);
