const fs = require('fs');
const path = require('path');

const directories = ['studio/src', 'studio/index.html', 'backend/index.js', 'backend/services', 'backend/whatsapp-tools', 'backend/controllers', 'README.md', 'PRIVACY.md'];

const replaceInFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  content = content.replace(/KJ Dance Studio/gi, 'expressionz Dance Studio');
  content = content.replace(/KJ Dance & Fitness Studio/gi, 'expressionz Dance Studio');
  content = content.replace(/KJ Dance Academy/gi, 'expressionz');
  content = content.replace(/KJ Dance/gi, 'expressionz');
  content = content.replace(/\bKJ\b/g, 'expressionz');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
};

const processPath = (itemPath) => {
  if (!fs.existsSync(itemPath)) return;
  const stat = fs.statSync(itemPath);
  if (stat.isDirectory()) {
    fs.readdirSync(itemPath).forEach((file) => {
      processPath(path.join(itemPath, file));
    });
  } else if (stat.isFile() && /\.(js|jsx|html|md|json)$/.test(itemPath)) {
    replaceInFile(itemPath);
  }
};

directories.forEach((dir) => processPath(path.join(__dirname, dir)));
console.log('Rebranding to expressionz complete!');
