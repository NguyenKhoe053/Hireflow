const fs = require('fs');

let indexContent = fs.readFileSync('index.html', 'utf8');
indexContent = indexContent.replace('--font: \'Inter\', \'Helvetica Neue\', helvetica, arial, sans-serif;', '--font: \'SF Pro Display\', \'Inter\', system-ui, -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, \'Helvetica Neue\', Arial, sans-serif;');
indexContent = indexContent.replace('</style>', '\n      h1, h2, h3, h4, h5, h6 { letter-spacing: -0.04em; }\n    </style>');
const statsStart = indexContent.indexOf('<!-- ===== STATS ===== -->');
const testEndStr = '</section>';
let testEnd = indexContent.indexOf(testEndStr, indexContent.indexOf('<!-- ===== TESTIMONIALS ===== -->'));
if (statsStart !== -1 && testEnd !== -1) {
  indexContent = indexContent.substring(0, statsStart) + indexContent.substring(testEnd + testEndStr.length);
}
fs.writeFileSync('index.html', indexContent, 'utf8');

let appContent = fs.readFileSync('app.html', 'utf8');
appContent = appContent.replace('--font: \'Inter\', sans-serif;', '--font: \'SF Pro Display\', \'Inter\', system-ui, -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, \'Helvetica Neue\', Arial, sans-serif;');
appContent = appContent.replace('</style>', '\n      h1, h2, h3, h4, h5, h6 { letter-spacing: -0.04em; }\n    </style>');
const scriptStart = appContent.indexOf('<script>');
const scriptEnd = appContent.lastIndexOf('</script>') + 9;
appContent = appContent.substring(0, scriptStart) + '<script src=\"app.js\"></script>\n</body>\n</html>';
fs.writeFileSync('app.html', appContent, 'utf8');

let appJsContent = fs.readFileSync('app.js', 'utf8');
appJsContent = appJsContent.replace('http://localhost:3000/api', 'https://hireflow-9fn2.onrender.com/api');
fs.writeFileSync('app.js', appJsContent, 'utf8');
