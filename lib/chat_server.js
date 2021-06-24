var socketio = require('socket.io')
var io;
var guestNumber = 1
var nickNames = {}
var nameUsed = []
var current = {}

exports.listen = function(server){
    io = socketio.listen(server)
    io.set('log level',1)
    io.sockets.on('connection',function (socket){
        guestNumber = assignGuestName(socket,guestNumber,nickNames,nameUsed)
        joinRoom(socket,'lobby')
        
        handdleMessageBroadcasting(socket,nickNames)

        handleNameChangeAttempts(socket,nickNames,nameUsed)

        handleRoomJoining(socket)

        socket.on('rooms',function(){
            socket.emit('rooms',io.sockets.manager.rooms)
        })

        handleClientDisconnection(socket,nickNames,nameUsed)
        
    })
}