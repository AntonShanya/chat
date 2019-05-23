var path = require('path');
const http = require('http');
var express = require('express');
//socket 1 step
const socketio = require('socket.io');
const Filter = require('bad-words');
const {generateMessage} = require('./utils/messages')
const {generateLocationMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')
var app = express();
const server = http.createServer(app);
//socket 2 step
const io = socketio(server);
const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));


//socket 3 step
io.on('connection', (socket) => {


      socket.on('sendMessage',(messagee, callback) => {
            const filter = new Filter()
            if(filter.isProfane(messagee.message)) {
                return callback('Profanity is not allowed!')
            }

            const userId = socket.id;
            const user = getUser(userId);
            io.to(user.room).emit('stampaPerTutti', generateMessage(messagee.message, messagee.username))
            callback('Delivered');
      })

      socket.on('disconnect', () => {
            const user = removeUser(socket.id)

            if(user){
              io.to(user.room).emit('funzioneSaluto', generateMessage('', `${user.username} has left!`))
              io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
              })
            }
      })

      socket.on('sendLocation',(l,callback) => {
            var coordinate = "https://google.com/maps?q="+l.latitude+","+ l.longitude;
            const user = getUser(socket.id);
            io.to(user.room).emit('locationMessage', generateLocationMessage(coordinate, l.username))
            callback("Posizione inviata in broadcast!");
      })
      // console.log('New WebSocket connection');
      //
      // socket.emit('countUpdated',count);
      //
      // socket.on('increment', () => {
      //   count++;
      //   io.emit('countUpdated',count)
      // })

      socket.on("join", (datiUser, callback) => {
        const {error, user} = addUser({id: socket.id, ...datiUser})

        if(error) {
          return callback(error);
        }

        socket.join(user.room)

        socket.emit('funzioneSaluto', generateMessage("Welcome Bitchone",`Admin`));

        socket.broadcast.to(user.room).emit('funzioneSaluto', generateMessage('',`${user.username} has joined a room`))

        io.to(user.room).emit('roomData', {
          room: user.room,
          users: getUsersInRoom(user.room)

        })
        callback();
        //io.emit("joinData", datiUser);

    //1. socket.emit => sends an event to a specific client
    //2. io.emit => sends an event to every connected client
    //3. socket.broadcast.emit => sends an event to every connected client except himself
//Now with rooms we gonna use the variation of 1 and 2.
    // io.to.emit => emmits an event to everybody into a specific room.
    // socket.broadcast.to.emit => sending an event to everyone except a specific chatroom
      })
})

server.listen(port, function() {
      console.log(`Server is ready on port ${port}`);
});
