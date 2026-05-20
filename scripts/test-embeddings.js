const { pipeline } = require('@xenova/transformers');

async function test() {
  console.log('Loading embedding model...');
  // Use a tiny model: ~50MB, runs on CPU
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
    quantized: true, // Use quantized version (smaller, faster)
  });
  console.log('Model loaded');

  const texts = [
    'cannabis accessories wholesale market',
    'agent agency revenue pricing',
    'browser fingerprinting security protection',
    'social media content creation pipeline',
  ];

  console.log('\nGenerating embeddings...');
  for (const text of texts) {
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    const embedding = Array.from(output.data);
    console.log(`"${text.substring(0, 50)}..." => ${embedding.length} dims, sample: [${embedding.slice(0, 3).map(v => v.toFixed(3)).join(', ')}]`);
  }

  // Test similarity
  const q1 = await extractor('how to make money with AI agents', { pooling: 'mean', normalize: true });
  const q2 = await extractor('cannabis glass pipes market research', { pooling: 'mean', normalize: true });
  const q3 = await extractor('agent agency business revenue model', { pooling: 'mean', normalize: true });

  const v1 = Array.from(q1.data);
  const v2 = Array.from(q2.data);
  const v3 = Array.from(q3.data);

  const sim = (a, b) => a.reduce((sum, v, i) => sum + v * b[i], 0);

  console.log('\nSimilarity:');
  console.log(`  "AI agents money" vs "cannabis glass": ${sim(v1, v2).toFixed(3)}`);
  console.log(`  "AI agents money" vs "agent agency revenue": ${sim(v1, v3).toFixed(3)}`);
}

test().catch(console.error);
