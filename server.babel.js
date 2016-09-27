import express from 'express';
import fs from 'fs';
import https from 'https';
import sio from 'socket.io';
const app = express(),
  options = { 
  	key: fs.readFileSync(__dirname + '/remoteavatar-key.pem'),
  	cert: fs.readFileSync(__dirname + '/remoteavatar-cert.pem')
  },
  server = https.createServer(options, app).listen(process.env.PORT || 3000),
  io = sio(server);
app.use(express.static('public'));
app.use((req, res) => res.sendFile(__dirname + '/public/index.html'));
io.sockets.on('connection', socket => {
  let room = '';
  const create = err => {
    if (err) {
      return console.log(err);
    }
    socket.join(room);
    socket.emit('create');
  };
  // sending to all clients in the room (channel) except sender
  socket.on('message', message => {console.log(200, message);
    socket.broadcast.to(room).emit('message', message)});
  socket.on('find', () => {
    const url = socket.request.headers.referer.split('/');
    room = url[url.length - 1];
    const sr = io.sockets.adapter.rooms[room];
    if (sr === undefined) {
      // no room with such name is found so create it
      socket.join(room);
      socket.emit('create');
    } else if (sr.length === 1) {
      socket.emit('join');
    } else { // max two clients
      socket.emit('full', room);
    }
  });
  socket.on('auth', data => {
    data.sid = socket.id;
    // sending to all clients in the room (channel) except sender
    socket.broadcast.to(room).emit('approve', data);
  });
  socket.on('accept', id => {
    io.sockets.connected[id].join(room);
    console.log('io.sockets.connected[id]', room, 111)
    // sending to all clients in 'game' room(channel), include sender
    io.in(room).emit('bridge');
  });
  socket.on('reject', () => socket.emit('full'));
  socket.on('leave', () => {
    // sending to all clients in the room (channel) except sender
    socket.broadcast.to(room).emit('hangup');
    console.log(119, 'disconnect', room);
    socket.leave(room);});
});