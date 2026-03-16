const https = require('https');
const fs = require('fs');
const path = require('path');

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

function fetchFile(file) {
  return new Promise((resolve, reject) => {
    const url = `${base}/${file}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const outPath = `gh_original/${file}`;
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, data);
        console.log(`✅ ${file} (${data.length} chars) - status: ${res.statusCode}`);
        resolve({ file, content: data, status: res.statusCode });
      });
    }).on('error', reject);
  });
}

(async () => {
  for (const file of files) {
    await fetchFile(file);
  }
  console.log('\n✅ All done!');
})();
