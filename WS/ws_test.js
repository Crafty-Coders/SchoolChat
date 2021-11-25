const { query } = require('express')
const io = require('socket.io-client')
const chalk = require('chalk')
let User1_data = {
    user_id: 1,
    name: 1,
    surname: 1,
    school_id: 1,
    class_id: 1,
    phone: 1,
    email: 7
}
var User1 = io.connect('http://localhost:3000', {query: User1_data})
let User2_data = {
    user_id: 2,
    name: 2,
    surname: 2,
    school_id: 2,
    class_id: 2,
    phone: 2,
    email: 2
}
var User2 = io.connect('http://localhost:3000', {query: User2_data})

User1.on('stat', (res) => {
    console.log(chalk.green(res))
})

User2.on('stat', (res) => {
    console.log(chalk.red(res))
})

socket.on('new_msg', (data) => console.log(data))