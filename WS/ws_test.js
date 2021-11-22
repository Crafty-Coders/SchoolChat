const io = require('socket.io-client')
var socket = io.connect('http://localhost:3000')
socket.emit("chat-msg", {a: 5, b: 7})

socket.on('stat', (res) => {
    console.log(res)
})

socket.on('new_msg', (data) => console.log(data))