const fs = require('fs');
const path = require('path');

const directories = ['studio/src', 'studio/index.html', 'backend/index.js', 'backend/services', 'backend/whatsapp-tools', 'backend/controllers', 'README.md', 'PRIVACY.md'];

const replaceInFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace various permutations
  content = content.replace(/Expressionz Dance Studio/gi, 'KJ Dance Studio');
  content = content.replace(/Expression Dance Studio/gi, 'KJ Dance Studio');
  content = content.replace(/Expressionz/gi, 'KJ');
  content = content.replace(/Expression/gi, 'KJ');
  
  // Specific fix for URL if any
  content = content.replace(/expressionzdancestudio\.in/gi, 'kjdancestudio.in');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
};

const processPath = (itemPath) => {
  if (!fs.existsSync(itemPath)) return;
  const stat = fs.statSync(itemPath);
  if (stat.isDirectory()) {
    fs.readdirSync(itemPath).forEach(file => {
      processPath(path.join(itemPath, file));
    });
  } else if (stat.isFile() && /\.(js|jsx|html|md|json)$/.test(itemPath)) {
    replaceInFile(itemPath);
  }
};

directories.forEach(dir => processPath(path.join(__dirname, dir)));
console.log('Rebranding complete!');
