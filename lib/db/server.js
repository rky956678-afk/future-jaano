const http = require('http');
const port = process.env.PORT || 3000;
http.createServer((_, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('@workspace/db ready\n');
}).listen(port, () => console.log(`[@workspace/db] port ${port}`));