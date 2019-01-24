const express = require('express');
const cors = require('cors');
const app = express();

// piSocket forwards sockets to the pi
const piServer = require('http').createServer();
const piSocket = require('socket.io')(piServer);
let piClient;

piSocket.on('connection', function(client) {
  console.log("Connected to pi");

  client.on('event', function(data) {
    console.log("Event");
    // Does nothing for now
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
  piClient.emit('unlock', '2.2', '4', '1.5', cb);
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

piServer.listen(3001, () => {
  console.log("Pi Server listening on 3001...");
});
app.listen(5001, () => {
  console.log("External Server listening on 5001...");
});
