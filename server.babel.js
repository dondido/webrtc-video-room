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
  // sending to all clients in the room (channel) except sender
  socket.on('message', message => socket.broadcast.to(room).emit('message', message));
  socket.on('find', () => {
    const url = socket.request.headers.referer.split('/');
    room = url[url.length - 1];
    console.log(110, room, socket.request.session.id)
    let sr = io.sockets.adapter.rooms[room];
    
    client.lrange(room, 0, -1, function(err, reply) {
      const host = 'sess:' + reply[0];
      console.log('reply', reply);
      if (reply.length === 0) {
        client.rpush([room, socket.request.session.id], function(err, reply) {
          console.log('reply1', err, reply);
          socket.join(room);
          socket.emit('create');
        });
      }
      else if (reply.length === 1) {

        client.exists(host, function(err, reply) {
          console.log('reply2', host, reply)
          if (reply === 1) {
              console.log('exists and join');
              // a room with a host is found
              client.rpush([room, socket.request.session.id], function(err, reply) {
                console.log('reply1', err, reply);
                socket.join(room);
                socket.emit('join');
              });
          } else {
            console.log('doesn\'t exist');
            client.lset([room, 0, socket.request.session.id], function(err, reply) {
              console.log('reply4', err, reply);
              socket.join(room);
              socket.emit('create');
            });
          }
        });
      }
      else if (reply.length === 2) {
        client.exists(host, function(err, reply) {
          if (reply === 1) {
              console.log('exists and full');
              // max two clients
              socket.emit('full');
          } else {
            client
              .multi()
              .del(room)
              .client.rpush([room, socket.request.session.id])
              .exec(function(err, reply) {
                console.log('reply3', err, reply);
                socket.join(room);
                socket.emit('create');
              })
          }
        });
      }
    });
    /*if (sr === undefined) {
      // no room with such name is found so create it
      socket.join(room);
      socket.emit('create');
      //socket.request.session.room = room;
      //socket.request.session.save();
      console.log(111, room, socket.request.session.save)
    } else if (sr.length === 1) {
      console.log(11, socket.id, sr)
      // a room with a host is found
      socket.emit('join');
    } else {
      // max two clients
      socket.emit('full');
    }*/
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
  socket.on('reject', () =>socket.emit('full'));
  socket.on('bye', () => {
    console.log('received bye');
  });
});