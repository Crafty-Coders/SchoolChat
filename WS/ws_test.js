const { query } = require('express')
const io = require('socket.io-client')
let User1_data = {

}
var User1 = io.connect('http://localhost:3000', {query: User1_data})
let User2_data = {

}
var User2 = io.connect('http://localhost:3000', {query: User2_data})

socket.on('stat', (res) => {
    console.log(res)
})

socket.on('new_msg', (data) => console.log(data))