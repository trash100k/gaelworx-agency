const { create, insert, search } = require('@orama/orama');

async function test() {
  const db = await create({
    schema: { title: 'string', content: 'string', category: 'string' },
    components: { tokenizer: { stemming: true } }
  });

  const docs = [
    { title: 'Cannabis Market Research', content: 'Cannabis accessories market includes glass pipes vaporizers rolling papers grinders. Market gap no B2B platform focused on accessories. Key complaints no verification system poor retailer intelligence outdated catalogs.', category: 'market' },
    { title: 'Agent Agency Business', content: 'Agent agency as a service. Set up multi-agent AI teams for businesses. Pricing 5-20K setup plus 2-5K monthly recurring revenue. Services include content creation automation consulting.', category: 'revenue' },
    { title: 'Revenue Streams', content: 'Multiple revenue streams vibe coding 2-8K monthly content agency 3-10K monthly per client real estate wholesaling 2-10K per deal white label SaaS 1-5K monthly.', category: 'revenue' },
    { title: 'Browser Security', content: 'Browser fingerprinting detection uses canvas WebGL audio context to identify users. Solutions residential proxies puppeteer stealth plugin cookie import.', category: 'security' },
    { title: 'Social Media Automation', content: 'Social media content creation pipeline. Platform-specific content for Twitter LinkedIn Instagram Reddit. No AI slop. Human in the loop quality control.', category: 'marketing' },
  ];

  for (const doc of docs) await insert(db, doc);

  const queries = [
    'how to make money with AI',
    'cannabis accessories business',
    'protect browser from detection',
    'social media content strategy',
    'what does Zach need to know',
  ];

  for (const q of queries) {
    const r = await search(db, {
      term: q,
      properties: ['title', 'content'],
      tolerance: 1,
      limit: 2,
      boost: { title: 2 },
    });
    console.log(`\n🔎 "${q}" => ${r.count} results`);
    r.hits.forEach(h => console.log(`  [${h.document.category}] ${h.document.title} (score: ${h.score.toFixed(2)})`));
  }
}

test().catch(console.error);
