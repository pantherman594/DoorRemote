const SERVER_ADDRESS = 'https://rpi.d-shen.xyz';
const socket = require('socket.io-client')(SERVER_ADDRESS);
const spawn = require('child_process').spawn;

socket.on('connect', () => {
  console.log("Connected to server");
});

socket.on('unlock', (openTime, waitTime, closeTime, callback) => {
  var status = { status: 'Success', error: '' };
  const pythonProcess = spawn('python', ['./unlockDoor.py', openTime, waitTime, closeTime], {
    detached: true,
  });
  callback();
  console.log("unlock");
});
