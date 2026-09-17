const express = require('express');
const app = express();
app.listen(0, () => console.log('server loaded okay'));
process.exit(0);
