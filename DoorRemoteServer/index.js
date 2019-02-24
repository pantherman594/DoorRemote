const SERVER_ADDRESS = 'https://rpi.d-shen.xyz';
const socket = require('socket.io-client')(SERVER_ADDRESS);
const spawn = require('child_process').spawn;
const raspividStream = require('raspivid-stream');

const videoSetup = [];
const stream = raspividStream({
  width: 512,
  height: 512,
  roi: '0.275,0.39,0.375,0.375',
});
// const stream = raspividStream();

socket.on('connect', () => {
  console.log("Connected to server");

  if (videoSetup.length === 2) {
    socket.binary(true).emit('videostream', { buffer: videoSetup[0] });
    socket.binary(true).emit('videostream', { buffer: videoSetup[1] });
  }
});

socket.on('unlock', (openTime, waitTime, closeTime, callback) => {
  var status = { status: 'Success', error: '' };
  const pythonProcess = spawn('python', ['./unlockDoor.py', openTime, waitTime, closeTime], {
    detached: true,
  });
  callback();
  console.log("unlock");
});

stream.on('data', (data) => {
  if (videoSetup.length < 2) {
    videoSetup[videoSetup.length] = data;
  }
  socket.binary(true).emit('videostream', { buffer: data });
});
