# DoorRemote

I made this to control a raspberry pi and a motor connected to my door handle, so I can open my dorm door with my phone in case I get locked out.

It has two parts to it. `DoorRemoteProxy` runs on a VPS and provides the web interface, and also forwards requests from the web interface to the server. `DoorRemoteServer` runs on the raspberry pi. Since I'm on my university network, I can't create a static address for other clients to connect to, so `DoorRemoteServer` connects to `DoorRemoteProxy` via web sockets.

`unlockDoor.py` is the script that turns on and off the motor to open and close the door handle.

# Usage
Copy both the proxy and server to a VPS and a raspberry pi, respectively.

On the raspberry pi, run:

```
pip install RPi.GPIO
```

On both, run:

```
yarn
node index.js
```
