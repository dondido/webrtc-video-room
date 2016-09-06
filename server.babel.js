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
  // sending to all clients in the room (channel) except sender
  socket.on('message', message => socket.broadcast.to(room).emit('message', message));
  socket.on('find', () => {
    const url = socket.request.headers.referer.split('/');
    room = url[url.length - 1];
    client.lrange(room, 0, -1, (err, reply) => {
      if (err) {
        return console.log(err);
      }
      const host = 'sess:' + reply[0];
      if (reply.length === 0) {
        client.rpush([room, sessionID], create);
      }
      else if (reply.length === 1) {
        client.exists(host, (err, reply) => {
          if (err) {
            return console.log(err);
          }
          // a room with a host is found
          reply === 1 ? socket.emit('join') : client.lset([room, 0, sessionID], create);
        });
      }
      else if (reply.length === 2) {
        client.exists(host, (err, reply) => {
          if (err) {
            return console.log(err);
          }
          // max two clients
          reply === 1 ? socket.emit('full') :
            client.multi().del(room).rpush([room, sessionID]).exec(create);
        });
      }
    });
  });
  socket.on('auth', data => {
    data.sid = socket.id;
    // sending to all clients in the room (channel) except sender
    socket.broadcast.to(room).emit('approve', data);
  });
  socket.on('accept', id => {
    const so = io.sockets.connected[id];
    client.rpush([room, so.request.sessionID], (err, reply) => {
      if (err) {
        return console.log(err);
      }
      so.join(room);
      // sending to all clients in 'game' room(channel), include sender
      io.in(room).emit('bridge');
    });
  });
  socket.on('reject', () =>socket.emit('full'));
  socket.on('bye', () => {
    console.log('received bye');
  });
});