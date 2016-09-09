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
    const url = socket.request.headers.referer.split('/');
    room = url[url.length - 1];
    const chatRoom = io.sockets.adapter.rooms[room];
    console.log(110, room, chatRoom, io.sockets.adapter.rooms)
    if (chatRoom === undefined) {
      // no room with such name is found so create it
      socket.join(room);
      socket.emit('create');
      console.log(115, room, socket.request.session)
    } else if (chatRoom.length === 1) {
      // a room with a host is found
      let sessionRoom = socket.request.session[room];
      console.log(112, room, Array.isArray(sessionRoom))
      if (Array.isArray(sessionRoom) === true &&
        sessionRoom.indexOf(io.sockets.connected[Object.keys(chatRoom.sockets)[0]].request.sessionID) !== 1) {
        socket.join(room);
        // sending to all clients in the room (channel) except sender
        socket.broadcast.to(room).emit('bridge', 'host');
        // sending to sender-client only
        socket.emit('bridge', 'guest');
      } else {
        console.log(117, room)
        socket.emit('join');
      }
    } else {
      console.log(113, room)
      // max two clients
      socket.emit('full');
    }
  });
  socket.on('auth', data => {
    data.sid = socket.id;
    console.log(116, data, io.sockets.adapter.rooms[room])
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
      console.log(118, peerSocket.request.session, socket.request.sessionID, socket.request.session, id)
      peerSocket.join(room);
      // sending to all clients in 'game' room(channel), include sender
      io.in(room).emit('bridge');
  });
  socket.on('reject', () => socket.emit('full'));
  socket.on('disconnect', () => socket.leave(room));
});