const { reset } = require('chalk')
const io = require('socket.io-client')
var socket = io.connect('http://localhost:3000')
socket.emit("change", {a: 5, b: 7})

socket.on('stat', (res) => {
    console.log(res)
})