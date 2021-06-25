var socketio = require('socket.io')
var io;
var guestNumber = 1
var nickNames = {}
var nameUsed = []
var currentRoom = {}

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

function assignGuestName(socket,guestNumber,nickNames,nameUsed){
    let name = 'Guest_' + guestNumber
    nickNames[socket.id] = name
    socket.emit('nameResult',{
        success:true,
        name:name
    })
    nameUsed.push(name)
    return guestNumber + 1
}

function joinRoom(socket,room){
    socket.join(room)
    currentRoom[socket.id] = room
    socket.emit('joinResult',{room:room})
    socket.broadcast.to(room).emit('message',{
        text:nickNames[socket.id] + ' has joined' + room + '.'
    })
    let usersInRoom = io.sockets.clients(room)
    if(usersInRoom.length > 1){
        let userSummary = 'User currently in ' + room + ':'
        for(let index in usersInRoom){
            let userSocketId = usersInRoom[index].id
            if(userSocketId != socket.id){
                if(index > 0){
                    userSummary+= ', '
                }
                userSummary += nickNames[userSocketId]
            }
        }
        userSummary += '.'
        socket.emit('message', {text:userSummary})
    }

}