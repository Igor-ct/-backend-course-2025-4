const fs = require('fs');
const http = require('http');
const { program } = require('commander');

program
  .requiredOption('-i, --input <file>', 'input JSON file')
  .requiredOption('-H, --host <host>', 'server host')
  .requiredOption('-p, --port <port>', 'server port');
 
program.parse(process.argv);
const options = program.opts();

if (!fs.existsSync(options.input)) {
  console.error('Cannot find input file');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Server is running\n');
});

server.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}/`);
});