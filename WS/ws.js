const { OK, Chat } = require("../DB/DB_init");
const { MessageDB, ChatUserDB } = require("../DB/DB_main");
const io = require("socket.io")(mobile_server);

async function get_users_online() {
    let online = []
    for (var i in io.sockets)
        online.push(io.sockets[i].user_id)
    return online
}

io.on('connection', (socket) => {
    console.log("new")

    // ! socket ~ User (AuthDB)
    // ? Getting req_data when auth(POST-GET request)
    socket.user_id = socket.handshake.query.user_id
    socket.name = socket.handshake.query.name
    socket.surname = socket.handshake.query.surname
    socket.school_id = socket.handshake.query.school_id
    socket.class_id = socket.handshake.query.class_id
    socket.phone = socket.handshake.query.phone
    socket.email = socket.handshake.query.email
    socket.picture_url = socket.handshake.query.picture_url

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
        switch (data.flag) {
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

    socket.on('get-online', (data) => {
        get_users_online().then(res => 
            socket.emit('online-incoming', res)).catch(err => 
                socket.emit('online-input', ERR))
    })



})
module.exports = { io }