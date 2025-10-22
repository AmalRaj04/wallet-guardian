const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const srcShims = path.join(repoRoot, 'src', 'types', 'shims.d.ts');
const destDir = path.join(repoRoot, '.react-router', 'types');

if (!fs.existsSync(srcShims)) {
  console.error('Missing source shims:', srcShims);
  process.exit(2);
}

fs.mkdirSync(destDir, { recursive: true });
const dest = path.join(destDir, 'shims.d.ts');

fs.copyFileSync(srcShims, dest);
console.log('Copied shims to', dest);
