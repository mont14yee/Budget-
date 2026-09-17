const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(
  '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic:wght@400;700&display=swap" rel="stylesheet">',
  '<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Noto+Sans+Ethiopic:wght@300;400;500;600;700&display=swap" rel="stylesheet">'
);

code = code.replace(
  "font-family: 'Noto Sans Ethiopic', 'Abyssinica SIL', sans-serif;",
  "font-family: 'Outfit', 'Noto Sans Ethiopic', 'Abyssinica SIL', sans-serif;"
);

fs.writeFileSync('index.html', code);
