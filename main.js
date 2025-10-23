const fs = require('fs').promises;
const http = require('http');
const { program } = require('commander');
const { XMLBuilder } = require('fast-xml-parser');
const url = require('url');


program
  .requiredOption('-i, --input <file>', 'input JSON file')
  .requiredOption('-h, --host <host>', 'server host')
  .requiredOption('-p, --port <port>', 'server port');

program.parse(process.argv);
const options = program.opts();


async function startServer() {
  try {

    await fs.access(options.input);
  } catch {
    console.error('Cannot find input file');
    process.exit(1);
  }


  const server = http.createServer(async (req, res) => {
    try {
      const query = url.parse(req.url, true).query;


      const jsonText = await fs.readFile(options.input, 'utf-8');

      let passengers;

      try {
        passengers = JSON.parse(jsonText);
      } catch {
        passengers = jsonText
          .split('\n')
          .filter(line => line.trim() !== '')
          .map(line => JSON.parse(line));
      }


      let filtered = passengers;
      if (query.survived === 'true') {
        filtered = filtered.filter(p => {
          const val = p.Survived;
          return val === 1 || val === '1' || val === true || val === 'true';
        });
      }

   
      const xmlData = {
        passengers: {
          passenger: filtered.map(p => {
            const obj = {
              name: p.Name || 'Unknown',
              ticket: p.Ticket || 'N/A'
            };
            if (query.age === 'true') {
              obj.age = p.Age ?? 'Unknown';
            }
            return obj;
          })
        }
      };

  
      const builder = new XMLBuilder({ format: true, ignoreAttributes: false });
      const xmlContent = builder.build(xmlData);


      await fs.writeFile('output.xml', xmlContent, 'utf-8');

    
      res.writeHead(200, { 'Content-Type': 'application/xml; charset=utf-8' });
      res.end(xmlContent);

    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Server error: ' + err.message);
    }
  });



  server.listen(options.port, options.host, () => {
    console.log(` Server running at http://${options.host}:${options.port}/`);
    console.log(`Use query parameters: ?survived=true&age=true`);
  });
}

startServer();