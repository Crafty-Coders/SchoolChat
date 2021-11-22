const { OK, Chat } = require("../DB/DB_init");
const { MessageDB, ChatUserDB } = require("../DB/DB_main");

const io = require("socket.io")(mobile_server);
io.on('connection', (socket) => {
    console.log("new")

    socket.on('chat-msg', (data) => {
        MessageDB.new_msg(data).then(res => {
            if (res == OK) {
                io.emit("new_msg", data)
                socket.emit('stat', OK)
            } else { socket.emit('stat', res) }
        }).catch(err => socket.emit('stat', err))
    })

    socket.on('delete-msg-for-all', (data) => {
        MessageDB.manage_msgs(data, "delete_all").then(res => {
            if (res == OK) {
                io.emit("d_a_msg", data)
                socket.emit('stat', OK)
            } else { socket.emit('stat', res) }
        }).catch(err => socket.emit('stat', err))
    })

    socket.on('delete-msg-for-user', (data) => {
        MessageDB.manage_msgs(data, "delete_one").then(res => {
            if (res == OK) {
                socket.emit("d_u_msg", data)
                socket.emit('stat', OK)
            } else { socket.emit('stat', res) }
        }).catch(err => socket.emit('stat', err))
    })

    socket.on('manage-chat', (data) => {
        ChatUserDB.manage_chat(data.data, data.flag).then(res => {
            if (res == OK) {
                io.emit("chat_event", data.data)
                socket.emit('stat', OK)
            } else { socket.emit('stat', res) }
        }).catch(err => socket.emit('stat', err))
    })

    socket.on('manage-user', (data) => {
        ChatUserDB.manage_user(data.data, data.flag).then(res => {
            if (res == OK) {
                io.emit("user_event", data.data)
                socket.emit('stat', OK)
            } else { socket.emit('stat', res) }
        }).catch(err => socket.emit('stat', err))
    })

    socket.on('get-info', (data) => {
        switch(data.flag){
            case "chat":
                ChatUserDB.get_user_info(data.data).then(res => 
                    socket.emit('chat_info', res)).catch(err =>
                    socket.enit('chat_info', err))
                break
            case "user":
                ChatUserDB.get_user_info(data.data).then(res => 
                    socket.emit('user_info', res)).catch(err =>
                    socket.enit('user_info', err))
                break
        }
    })

    
})
module.exports = { io }