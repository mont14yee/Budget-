const fs = require('fs');

// Fix CSS
let css = fs.readFileSync('index.css', 'utf8');
css = css.replace(/bg-muted-foreground\/30/g, 'bg-gray-400/30');
css = css.replace(/bg-muted-foreground\/50/g, 'bg-gray-400/50');
fs.writeFileSync('index.css', css);

// Fix App.tsx return statement
let app = fs.readFileSync('App.tsx', 'utf8');
app = app.replace(/return \n<div className=\{\`min-h-screen/g, 'return <div className={`min-h-screen');
fs.writeFileSync('App.tsx', app);

