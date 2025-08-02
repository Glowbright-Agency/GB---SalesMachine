const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>GB Sales Machine - Test</title>
    </head>
    <body>
      <h1>Server is working!</h1>
      <p>If you can see this, the connection is fine.</p>
      <p>Next.js app should work too.</p>
      <a href="/onboarding">Go to Onboarding</a>
    </body>
    </html>
  `);
});

server.listen(port, hostname, () => {
  console.log(`Test server running at http://${hostname}:${port}/`);
  console.log('Press Ctrl+C to stop');
});