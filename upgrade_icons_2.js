const fs = require('fs');

const mappings = {
  '⏰': '<i data-lucide="clock"></i>',
  '★': '<i data-lucide="star" style="fill:currentColor;color:gold;width:14px;height:14px;vertical-align:middle;"></i>',
  '☆': '<i data-lucide="star" style="color:gold;width:14px;height:14px;vertical-align:middle;"></i>',
  '📎': '<i data-lucide="paperclip"></i>',
  '❌': '<i data-lucide="x"></i>'
};

function replaceEmojis(text) {
  let res = text;
  for (const [emoji, icon] of Object.entries(mappings)) {
    res = res.split(emoji).join(icon);
  }
  return res;
}

if (fs.existsSync('app.js')) {
  let content = fs.readFileSync('app.js', 'utf8');
  content = replaceEmojis(content);
  fs.writeFileSync('app.js', content, 'utf8');
}
