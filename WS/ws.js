const { text } = require("express");
const { OK, Chat } = require("../DB/DB_init");
const { MessageDB, AuthDB } = require("../DB/DB_main");
const ChatUserDB = require('../DB/Tables/Chat-User')
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

    socket.on('add-chat', (data) => {
        // Создание нового чата аргументы: users - Пользователи, добавленные при создании(ID),
        // name - название чата
        // user_id - ID создателя чата
        ChatUserDB.manage_chat(data, 'create').then(res => {
            if (res == OK) {
                io.emit('new-chat', data)
                socket.emit('stat', OK)
            }
        }).catch(err => {
            socket.emit('stat', err)
        })
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
                // Получение данных о чатах (не только для превью, название сокетов врет)
                console.log("aboba")
                ChatUserDB.get_chat_info(data.data).then(res1 => {
                    console.log("1");
                    MessageDB.get_last_message(data.data).then(res2 => {
                        console.log(res2)
                        let userid = 0
                        if (res2 != undefined) userid = res2.user_id
                        AuthDB.get_name_surname({"id": userid}).then(res3 => {
                            let res = {
                                "chat": res1,
                                "last_msg": {
                                    "text": res2 == undefined ? "" : res2.text,
                                    "user_id": res2 == undefined ? "" : res2.user_id,
                                    "time": res2 == undefined ? "" : res2.updatedAt,
                                    "userdata": res3
                                }
                            }
                            socket.emit('chat_preview_info', res)
                        })
                        
                        })})
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

    socket.on("chats", (data) => {
        // Получает ID всех чатов, в которых состоит пользователь
        ChatUserDB.get_user_chats({"user_id": data.user_id}).then(res =>{   
            socket.emit('recieve-chats', {res})
            console.log(res)
        }).catch(err => socket.emit('recieve-chats', {err}))
    })


    socket.on("chat-msgs", (data) => {

    })

    socket.on("newMessage", (data) => {
        /*
        New massage handler
        */
        MessageDB.new_msg(data).then(res => {
            MessageDB.get_last_id_with_time().then(res2 => {
                AuthDB.get_name_surname({"id": data.user_id}).then(res3 => {
                console.log("ABOBA")
                io.emit('msg', {'id': res2.id,
                    'user_id': data.user_id,
                    'text': data.text, 
                    'chat_id': data.chat_id, 
                    'attachments': data.attachments,
                    'deleted_user': data.deleted_user,
                    'deleted_all': data.deleted_all,
                    'edited': data.edited,
                    'updatedAt':res2.time,
                    'service': false,
                    'user_name': res3})
                    })
                }).catch(err => console.log(err))
        console.log(data)}).catch(res => console.log(res))
    })

    socket.on("get-msgs", (data) => {
        /*
        Получение сообщений чата
        */
        console.log("Messages requested")
        MessageDB.get_all_showing_msgs(data).then(res => {
            socket.emit("chat-message-recieve", {'data': res})
        })
    })

    socket.on("get-users-by-school", (data) => {
        /*
        Получение списка пользователей из определенной школы
        */
        AuthDB.get_users_by_school(data).then(res => {
            socket.emit("get_users_school", {'data': res})
            console.log("sent")
        })
    })

})
module.exports = { io }