import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const base = 'https://raw.githubusercontent.com/roz-logic/temporal-binding-predictive-processing/refs/heads/main/src';

const files = [
  'App.tsx',
  'main.tsx',
  'index.css',
  'utils/cn.ts',
  'data/experimentData.ts',
  'components/GroupedBarChart.tsx',
  'components/StatBadge.tsx',
  'components/SectionHeader.tsx',
  'components/ResultCard.tsx',
  'components/Navbar.tsx',
  'components/Hero.tsx',
  'components/OverviewCards.tsx',
  'components/References.tsx',
  'sections/Experiment1.tsx',
  'sections/Experiment2.tsx',
  'sections/Experiment3.tsx',
];

for (const file of files) {
  const url = `${base}/${file}`;
  const res = await fetch(url);
  const text = await res.text();
  const outPath = `original_src/${file}`;
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, text);
  console.log(`✅ ${file} (${text.length} chars)`);
}

console.log('\nDone! All files fetched.');
