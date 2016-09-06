import express from 'express';
import fs from 'fs';
import https from 'https';
import sio from 'socket.io';
import session from 'express-session';
import redis from 'redis';
import connectRedis from 'connect-redis';
const app = express(),
  options = { 
  	key: fs.readFileSync(__dirname + '/remoteavatar-key.pem'),
  	cert: fs.readFileSync(__dirname + '/remoteavatar-cert.pem')
  },
  server = https.createServer(options, app).listen(process.env.PORT || 3000),
  io = sio(server),
  client = redis.createClient(),
  RedisStore = connectRedis(session),
  redisStore = new RedisStore({client: client}),
  sessionMiddleware = session({
      store: redisStore,
      secret: process.env.SESSION_SECRET || 'secret',
      resave: false,
      saveUninitialized: true
  });
app.use(sessionMiddleware);
io.use((socket, next) => sessionMiddleware(socket.request, socket.request.res, next));
app.use(express.static('public'));
app.use((req, res) => res.sendFile(__dirname + '/public/index.html'));
io.sockets.on('connection', socket => {
  let room = '';
  const sessionID = socket.request.sessionID,
    create = err => {
      if (err) {
        return console.log(err);
      }
      socket.join(room);
      socket.emit('create');
    };
  console.log(111, io.sockets.connected[socket.id].request.session.save)
  // sending to all clients in the room (channel) except sender
  socket.on('message', message => socket.broadcast.to(room).emit('message', message));
  socket.on('find', () => {
    const url = socket.request.headers.referer.split('/'),
      room = url[url.length - 1],
      chatRoom = io.sockets.adapter.rooms[room];
    if (chatRoom === undefined) {
      // no room with such name is found so create it
      socket.join(room);
      socket.emit('create');
      console.log(111, room, socket.request.session.save)
    } else if (chatRoom.length === 1) {
      // a room with a host is found
      let sessionRoom = socket.request.session[room];
      if (Array.isArray(sessionRoom) === true) {
        if (sessionRoom.includes(socket.request.sessionID) === true) {
          // host of the room is welcome to take her place
          socket.join(room);
          socket.emit('create');
        } else if (sessionRoom.includes(io.sockets.connected[Object.keys(chatRoom)[0]].request.sessionID) === true) {
          socket.join(room);
          // sending to all clients in 'game' room(channel), include sender
          io.in(room).emit('bridge');
        } else {
          socket.emit('join');
        }
      } else {
        socket.emit('join');
      }
    } else {
      // max two clients
      socket.emit('full');
    }
  });
  socket.on('auth', data => {
    data.sid = socket.id;
    // sending to all clients in the room (channel) except sender
    socket.broadcast.to(room).emit('approve', data);
  });
  socket.on('accept', id => {
    const peerSocket = io.sockets.connected[id],
      upsert = (sess, id) => {
        sess[room] = sess[room] || [];
        sess[room].push(id);
        sess.save();
      };
      upsert(peerSocket.request.session, socket.request.sessionID);
      upsert(socket.request.session, id);
      peerSocket.join(room);
      // sending to all clients in 'game' room(channel), include sender
      io.in(room).emit('bridge');
  });
  socket.on('reject', () =>socket.emit('full'));
  socket.on('bye', () => {
    console.log('received bye');
  });
});