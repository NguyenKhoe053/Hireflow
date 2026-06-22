const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

if (!content.includes('challenges.cloudflare.com')) {
  // Find the LAST </head> tag, not the one in the Javascript string
  let lastHeadIndex = content.lastIndexOf('</head>');
  if (lastHeadIndex !== -1) {
    content = content.substring(0, lastHeadIndex) + 
      '  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" async defer></script>\n' + 
      content.substring(lastHeadIndex);
  }
}

const splashHtml = `  <!-- Cloudflare Splash Screen -->
  <div id="cf-splash" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:#121212; z-index:999999; display:flex; flex-direction:column; justify-content:center; align-items:center; color:#fff; font-family:var(--font);">
    <h2 style="margin-bottom:15px; font-weight:600; font-size:24px;">Tuyển Thực Tập</h2>
    <p style="color:#a0a0a0; margin-bottom:30px; font-size:15px;">Đang kiểm tra mức độ an toàn của kết nối mạng...</p>
    <div style="height:65px; overflow:hidden; display:flex; justify-content:center; width:100%;">
      <div id="cf-turnstile-index"></div>
    </div>
    <p style="color:#666; margin-top:30px; font-size:12px;">Security check by Cloudflare</p>
  </div>
  <script>
    setTimeout(() => {
      if(window.turnstile) {
        turnstile.render('#cf-turnstile-index', { sitekey: '1x00000000000000000000AA', theme: 'dark' });
      }
      setTimeout(() => {
        const splash = document.getElementById('cf-splash');
        if(splash) {
          splash.style.transition = 'opacity 0.4s ease';
          splash.style.opacity = '0';
          setTimeout(() => splash.remove(), 400);
        }
      }, 1500);
    }, 150);
  </script>`;

if (!content.includes('cf-splash')) {
  content = content.replace('<body>', '<body>\n' + splashHtml);
}

fs.writeFileSync('index.html', content);
console.log('Successfully injected splash screen');
