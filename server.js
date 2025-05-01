const path=require('path');
const http=require('http');
const express=require('express')
const socketio=require('socket.io')
const formatMessage=require('./utils/messages')
const {userJoin,getCurrentuser,getRoomUsers,userLeave}=require('./utils/users.js')


const app=express();
const server=http.createServer(app);
const io=socketio(server)

const botName='chatCord'

app.use(express.static(path.join(__dirname,'public')))

io.on('connection',socket=>{

    socket.on('joinRoom',({username,room})=>{
        const user=userJoin(socket.id,username,room)
        socket.join(user.room)

        //welcome message
    socket.emit('message',formatMessage(botName,' welcome to the chat app'))

    //when new user joins the chat
    socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has joined the chat`));

    //send users and room information
    io.to(user.room).emit('roomUsers',
        {
        room:user.room,
        users:getRoomUsers(user.room)
    })
})
    

    //listen for chat message
    socket.on('chatMessage',(msg)=>{
        const user=getCurrentuser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg))
    })


     //when a user leaves the chat
     socket.on('disconnect',()=>{
        const user=userLeave(socket.id);
        if(user){
        io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`))

        io.to(user.room).emit('roomUsers',
            {
            room:user.room,
            users:getRoomUsers(user.room)
        })
        }
    })
    
})




const PORT=3000;
server.listen( PORT,()=>{
    console.log(`http://localhost:3000`)
})