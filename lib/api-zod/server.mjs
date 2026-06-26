import http from 'http';
const port = process.env.PORT || 3000;
http.createServer((_, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('@workspace/api-zod ready\n');
}).listen(port, () => console.log([@workspace/api-zod] port ));