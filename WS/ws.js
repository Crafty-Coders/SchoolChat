const { text } = require("express");
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
    console.log(socket.handshake.query)

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
    
    socket.emit('connected')

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
                ChatUserDB.get_chat_info(data.data).then(res =>
                    socket.emit('chat_info', res)).catch(err =>
                        socket.emit('chat_info', err))
                break
            case "chat-for-preview":
                console.log("aboba")
                ChatUserDB.get_chat_info(data.data).then(res1 => {
                    console.log("1");
                    MessageDB.get_last_message(data.data).then(res2 => {
                        console.log(res2)
                        res = {
                            "chat": res1,
                            "last_msg": {
                                "text": res2 == undefined ? "" : res2.text,
                                "user_id": res2 == undefined ? "" : res2.user_id,
                                "time": res2 == undefined ? "" : res2.updatedAt
                            }
                        }
                        socket.emit('chat_preview_info', res)})})
                        .catch(err =>
                        socket.emit('chat_preview_info', err))
                break
            case "user":
                ChatUserDB.get_user_info(data.data).then(res =>
                    socket.emit('user_info', res)).catch(err =>
                        socket.emit('user_info', err))
                break
        }
    })

    socket.on('get-online', (data) => {
        get_users_online().then(res => 
            socket.emit('online-incoming', res)).catch(err => 
                socket.emit('online-input', ERR))
    })

    socket.on("chats", (data) => {
        //console.log(data)
        ChatUserDB.get_user_chats({"user_id": data.user_id}).then(res =>{   
            socket.emit('recieve-chats', {res})
            console.log(res)
        }).catch(err => socket.emit('recieve-chats', {err}))
    })


    socket.on("chat-msgs", (data) => {

    })

    socket.on("newMessage", (data) => {
        MessageDB.new_msg(data).then(res => {
            MessageDB.get_last_id().then(res2 => {
                io.emit('msg', {'id': res2,
                    'user_id': data.user_id,
                    'text': data.text, 
                    'chat_id': data.chat_id, 
                    'attachments': data.attachments,
                    'deleted_user': data.deleted_user,
                    'deleted_all': data.deleted_all,
                    'edited': data.edited})})
        console.log(data)})
    })

    socket.on("get-msgs", (data) => {
        MessageDB.get_all_showing_msgs(data).then(res => {
            socket.emit("chat-message-recieve", {'data': res})
        })
    })

})
module.exports = { io }