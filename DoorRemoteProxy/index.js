const express = require('express');
const cors = require('cors');
const socketIo = require('socket.io');
const http = require('http');
const app = express();
const ws = require('express-ws')(app);

// piSocket forwards sockets to the pi
const piServer = http.createServer();
const piSocket = socketIo(piServer);
let piClient;

const videoClients = new Set();
let videoSetup = [];

piSocket.on('connection', function(client) {
  console.log("Connected to pi");
  videoSetup = [];

  client.on('event', function(data) {
    console.log("Event");
    // Does nothing for now
  });

  client.on('videostream', (data) => {
    if (videoSetup.length < 2) {
      videoSetup[videoSetup.length] = data.buffer;
    }

    console.log(videoClients.size);
    videoClients.forEach((client) => {
      client.send(data.buffer, { binary: true }, (error) => { if (error) console.error(error); });
    });
  });

  client.on('disconnect', function() {
    // Does nothing for now
  });

  piClient = client;
});

var allowedOrigins = ['https://door.d-shen.xyz'];
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

const unlock = (cb) => {
  piClient.emit('unlock', '3.7', '0', '1.9', cb);
};

app.use(express.static('public'));
app.post('/', (req, res) => {
  unlock(() => {
    res.json({
      status: 'success',
      error: ''
    });
  });
});

// Dialog flow
app.post('/df', (req, res) => {
  unlock();
  res.json({
    payload: {
      google: {
        expectUserResponse: false,
        richResponse: {
          items: [
            {
              simpleResponse: {
                textToSpeech: 'Okay, I\'m opening your door!',
              },
            },
          ],
        },
      },
    },
    source: 'Door Remote Proxy',
  });
});

app.ws('/videostream', (s, req) => {
  console.log('Stream client connected.');
  
  s.send(JSON.stringify({
    action: 'init',
    width: '512',
    height: '512'
  }));

  if (videoSetup.length === 2) {
    s.send(videoSetup[0], { binary: true }, (error) => { if (error) console.error(error); });
    s.send(videoSetup[1], { binary: true }, (error) => { if (error) console.error(error); });
  }

  videoClients.add(s);

  s.on('close', () => {
    console.log('Client left');
    videoClients.delete(s);
  });
});

piServer.listen(3001, () => {
  console.log("Pi Server listening on 3001...");
});
app.listen(5001, () => {
  console.log("External Server listening on 5001...");
});
