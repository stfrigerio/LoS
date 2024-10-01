const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const cors = require('cors')
const os = require('os');

const app = express();
const port = 3001;

// extend the body parser to handle large requests for the summaries of the sync
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({limit: '100mb', extended: true}));

console.log(Intl.DateTimeFormat().resolvedOptions().timeZone)

app.use(express.json());
app.use(cors())
app.use('/', routes);

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});


function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const interfaceName of Object.keys(interfaces)) {
    for (const iface of interfaces[interfaceName]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost'; // Fallback to localhost if no suitable IP is found
}

const ipAddress = getLocalIpAddress();

app.listen(port, () => {
  console.log(`Server running on http://${ipAddress}:${port}`);
});