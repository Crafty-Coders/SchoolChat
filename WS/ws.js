const io = require("socket.io")(mobile_server);
io.on('connection', (socket) => {
    console.log("new", socket)
    socket.username = "aboba"

    socket.on('change', (data) => {
        console.log(data)
        socket.username = data.username
        socket.emit('stat', "OK")
    })
})
module.exports = {io}