const socketIo = require('socket.io');
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

function handleNameChangeAttempts(socket, nickNames, nameUsed){
    socket.on('nameAttempt',function(name){
        if(nameUsed.indexOf(name) == -1){ // not register
            let previousName = nickNames[socket.id]
            let previousNameIndex = nameUsed.indexOf(previousName)
            nameUsed.push(name)
            nickNames[socket.id] = name
            delete nameUsed[previousNameIndex]
            socket.emit('nameResult',{success:true,name:name})
            socket.broadcast.to(currentRoom[socket.id].emit('message',{
                text: previousName + 'is now known as ' + name + '.'
            }))
        }else{
            socket.emit({
                success:false,
                message:'has been used by another user.'
            })
        }
    }) 
}

function handdleMessageBroadcasting(socket){
    socket.on('message',function(req){
        socket.broadcast.to(req.room).emit('message',{
            text:nickNames[socket.id]+' : '+req.text
        })
    })
}

function handleRoomJoining(socket){
    socket.on('join',function(req){
        socket.leave(currentRoom[socket.id])
        joinRoom(socket,req.newRoom)
    })
}

function handleClientDisconnection(socket){
    socket.on('disconnect',function(){
        let nameIndex = nameUsed.indexOf(nikeNames[socket.id])
        delete nameUsed[nameIndex]
        delete nikeNames[socket.id]
    })
}