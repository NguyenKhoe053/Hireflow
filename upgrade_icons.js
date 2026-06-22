const fs = require('fs');

const mappings = {
  '💼': '<i data-lucide="briefcase"></i>',
  '👤': '<i data-lucide="user"></i>',
  '🏢': '<i data-lucide="building"></i>',
  '📋': '<i data-lucide="clipboard-list"></i>',
  '📊': '<i data-lucide="bar-chart-2"></i>',
  '✅': '<i data-lucide="check-circle"></i>',
  '🤖': '<i data-lucide="bot"></i>',
  '📅': '<i data-lucide="calendar"></i>',
  '🔒': '<i data-lucide="lock"></i>',
  '🌐': '<i data-lucide="globe"></i>',
  '⚙️': '<i data-lucide="settings"></i>',
  '⚡': '<i data-lucide="zap"></i>',
  '💻': '<i data-lucide="monitor"></i>',
  '👥': '<i data-lucide="users"></i>',
  '📱': '<i data-lucide="smartphone"></i>',
  '🚀': '<i data-lucide="rocket"></i>',
  '📁': '<i data-lucide="folder"></i>',
  '🎨': '<i data-lucide="palette"></i>',
  '🐱': '<i data-lucide="github"></i>',
  '🐦': '<i data-lucide="twitter"></i>',
  '🐈': '<i data-lucide="github"></i>',
  '⭐': '<i data-lucide="star"></i>',
  '📍': '<i data-lucide="map-pin"></i>',
  '💰': '<i data-lucide="circle-dollar-sign"></i>',
  '⏱️': '<i data-lucide="clock"></i>',
  '📝': '<i data-lucide="file-text"></i>',
  '🔔': '<i data-lucide="bell"></i>',
  '🚪': '<i data-lucide="log-out"></i>',
  '🔙': '<i data-lucide="arrow-left"></i>',
  '❌': '<i data-lucide="x"></i>'
};

const headInjection = '<script src="https://unpkg.com/lucide@latest"></script>\n' +
'<style>\n' +
'  [data-lucide] {\n' +
'    width: 1.2em;\n' +
'    height: 1.2em;\n' +
'    vertical-align: -0.2em;\n' +
'    stroke-width: 2.2;\n' +
'  }\n' +
'  .logo-box [data-lucide], .logo-icon [data-lucide] {\n' +
'    width: 24px; height: 24px; color: #fff;\n' +
'  }\n' +
'  .tech-icon [data-lucide] {\n' +
'    width: 28px; height: 28px; color: #1ed760;\n' +
'  }\n' +
'  .ql-btn [data-lucide] { margin-right: 8px; color: #1ed760; }\n' +
'</style>';

const bodyInjection = '<script>\n' +
'  lucide.createIcons();\n' +
'  const observer = new MutationObserver((mutations) => {\n' +
'    let shouldUpdate = false;\n' +
'    for(let m of mutations) {\n' +
'      if(m.addedNodes.length > 0) {\n' +
'        shouldUpdate = true;\n' +
'        break;\n' +
'      }\n' +
'    }\n' +
'    if(shouldUpdate) lucide.createIcons();\n' +
'  });\n' +
'  observer.observe(document.body, { childList: true, subtree: true });\n' +
'</script>';

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
    
    if (!content.includes('unpkg.com/lucide')) {
      content = content.replace('</head>', headInjection + '\n</head>');
    }
    if (!content.includes('lucide.createIcons()')) {
      content = content.replace('</body>', bodyInjection + '\n</body>');
    }
    
    fs.writeFileSync(file, content, 'utf8');
  }
});

if (fs.existsSync('app.js')) {
  let content = fs.readFileSync('app.js', 'utf8');
  content = replaceEmojis(content);
  fs.writeFileSync('app.js', content, 'utf8');
}
