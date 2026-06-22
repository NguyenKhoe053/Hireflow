const fs = require('fs');

const mappings = {
  '💼': '<span class="material-symbols-rounded">work</span>',
  '👤': '<span class="material-symbols-rounded">person</span>',
  '🏢': '<span class="material-symbols-rounded">domain</span>',
  '📋': '<span class="material-symbols-rounded">assignment</span>',
  '📊': '<span class="material-symbols-rounded">bar_chart</span>',
  '✅': '<span class="material-symbols-rounded">check_circle</span>',
  '🤖': '<span class="material-symbols-rounded">smart_toy</span>',
  '📅': '<span class="material-symbols-rounded">calendar_month</span>',
  '🔒': '<span class="material-symbols-rounded">lock</span>',
  '🌐': '<span class="material-symbols-rounded">language</span>',
  '⚙️': '<span class="material-symbols-rounded">settings</span>',
  '⚡': '<span class="material-symbols-rounded">bolt</span>',
  '💻': '<span class="material-symbols-rounded">computer</span>',
  '👥': '<span class="material-symbols-rounded">group</span>',
  '📱': '<span class="material-symbols-rounded">smartphone</span>',
  '🚀': '<span class="material-symbols-rounded">rocket_launch</span>',
  '📁': '<span class="material-symbols-rounded">folder</span>',
  '🎨': '<span class="material-symbols-rounded">palette</span>',
  '🐱': '<span class="material-symbols-rounded">code</span>',
  '🐈': '<span class="material-symbols-rounded">code</span>',
  '🐦': '<span class="material-symbols-rounded">share</span>',
  '⭐': '<span class="material-symbols-rounded" style="color:gold;font-variation-settings:\\\'FILL\\\' 1">star</span>',
  '★': '<span class="material-symbols-rounded" style="color:gold;font-variation-settings:\\\'FILL\\\' 1">star</span>',
  '☆': '<span class="material-symbols-rounded" style="color:gold;font-variation-settings:\\\'FILL\\\' 0">star</span>',
  '📍': '<span class="material-symbols-rounded">location_on</span>',
  '💰': '<span class="material-symbols-rounded">payments</span>',
  '⏱️': '<span class="material-symbols-rounded">schedule</span>',
  '⏰': '<span class="material-symbols-rounded">schedule</span>',
  '📝': '<span class="material-symbols-rounded">edit_document</span>',
  '🔔': '<span class="material-symbols-rounded">notifications</span>',
  '🚪': '<span class="material-symbols-rounded">logout</span>',
  '🔙': '<span class="material-symbols-rounded">arrow_back</span>',
  '❌': '<span class="material-symbols-rounded">close</span>',
  '✖': '<span class="material-symbols-rounded">close</span>',
  '⏳': '<span class="material-symbols-rounded">hourglass_empty</span>',
  '📄': '<span class="material-symbols-rounded">description</span>'
};

const headInjection = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0" />\n' +
'<style>\n' +
'  .material-symbols-rounded {\n' +
'    vertical-align: middle;\n' +
'    font-size: 1.2em;\n' +
'  }\n' +
'  .logo-box .material-symbols-rounded, .logo-icon .material-symbols-rounded {\n' +
'    font-size: 24px; color: #fff;\n' +
'  }\n' +
'  .tech-icon .material-symbols-rounded {\n' +
'    font-size: 28px; color: #1ed760;\n' +
'  }\n' +
'  .ql-btn .material-symbols-rounded { margin-right: 8px; color: #1ed760; }\n' +
'</style>';

function replaceEmojis(text) {
  let res = text;
  for (const [emoji, icon] of Object.entries(mappings)) {
    res = res.split(emoji).join(icon);
  }
  return res;
}

['index.html', 'app.html'].forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = replaceEmojis(content);
    
    // Restore favicon specifically because spans cannot be inside svg text nodes
    content = content.replace(/<text y='\.9em' font-size='70' x='15'><span[^>]*>work<\/span><\/text>/g, "<text y='.9em' font-size='70' x='15'>💼</text>");

    if (!content.includes('Material+Symbols+Rounded')) {
      content = content.replace('</head>', headInjection + '\n</head>');
    }
    
    fs.writeFileSync(file, content, 'utf8');
  }
});

if (fs.existsSync('app.js')) {
  let content = fs.readFileSync('app.js', 'utf8');
  content = replaceEmojis(content);
  fs.writeFileSync('app.js', content, 'utf8');
}
