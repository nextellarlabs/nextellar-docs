const fs = require('fs');
const cp = require('child_process');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  list.forEach(file => {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (filePath.endsWith('.mdx')) {
      results.push(filePath);
    }
  });
  return results;
}

const files = walk('docs');
let updatedCount = 0;
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  if (!content.match(/^date:/m)) {
    try {
      const gitDate = cp.execSync(`git log -1 --format=%cd --date=short -- "${f}"`).toString().trim();
      const dateStr = gitDate || new Date().toISOString().split('T')[0];
      
      let lines = content.split('\n');
      if (lines[0].trim() === '---') {
         let endIdx = lines.indexOf('---', 1);
         if (endIdx !== -1) {
             // Insert date before the closing ---
             lines.splice(endIdx, 0, `date: ${dateStr}`);
             fs.writeFileSync(f, lines.join('\n'));
             updatedCount++;
         }
      }
    } catch(e) {
       console.error(`Failed to process ${f}`, e);
    }
  }
});

console.log(`Updated ${updatedCount} files.`);
