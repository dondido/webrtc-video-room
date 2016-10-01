import express from 'express';
import path from 'path';
import fs from 'fs';
import http from 'http';
import https from 'https';
import sio from 'socket.io';
import favicon from 'serve-favicon';
import compression from 'compression';

const app = express(),
  options = { 
    key: fs.readFileSync(__dirname + '/rtc-video-room-key.pem'),
    cert: fs.readFileSync(__dirname + '/rtc-video-room-cert.pem')
  },
  port = process.env.PORT || 3000,
  server = process.env.NODE_ENV === 'production' ?
    http.createServer(app).listen(port) :
    https.createServer(options, app).listen(port),
  io = sio(server);
// compress all requests
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res) => res.sendFile(__dirname + '/public/index.html'));
app.use(favicon('./public/favicon.ico'));
// Switch off the default 'X-Powered-By: Express' header
app.disable('x-powered-by');
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
    // sending to all clients in 'game' room(channel), include sender
    io.in(room).emit('bridge');
  });
  socket.on('reject', () => socket.emit('full'));
  socket.on('leave', () => {
    // sending to all clients in the room (channel) except sender
    socket.broadcast.to(room).emit('hangup');
    socket.leave(room);});
});