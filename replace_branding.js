const fs = require('fs');
const path = require('path');

const directories = ['studio/src', 'studio/index.html', 'backend/index.js', 'backend/services', 'backend/whatsapp-tools', 'backend/controllers', 'README.md', 'PRIVACY.md'];

const replaceInFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace various permutations
  content = content.replace(/KJ Dance Studio/gi, 'Expressionz Dance Studio');
  content = content.replace(/KJ Dance & Fitness Studio/gi, 'Expressionz Dance Studio');
  content = content.replace(/KJ Dance Academy/gi, 'Expressionz');
  content = content.replace(/KJ Dance/gi, 'Expressionz');
  content = content.replace(/\bKJ\b/g, 'Expressionz');
  
  // Specific fix for URL if any
  content = content.replace(/kjdancestudio\.in/gi, 'expressionzdancestudio.in');

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
