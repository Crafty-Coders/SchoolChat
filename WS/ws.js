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

    socket.emit('connected')
    console.log("connected")

    socket.on("register", (data) => {
        AuthDB.register(data).then(res => {
            socket.emit('register_ans', res)
        })
    })

    socket.on('connection-test', (data) => {
        socket.emit('connection-stat', { "stat": 'OK' })
    })

    socket.on('auth-data', (data) => {
        AuthDB.getAuthData(data).then(res => {
            socket.emit('auth-recieve', res)
        })
    })

    socket.on('delete-msg-all', (data) => {
        MessageDB.manage_msgs(data, "delete_all").then(res => {
            io.emit('message-deleted', res)
        })
    })

    socket.on('delete-msg-user', (data) => {
        MessageDB.manage_msgs(data, "delete_one").then(res => {
            socket.emit('message-deleted', res)
        })
    })

    socket.on('edit-msg', (data) => {
        MessageDB.manage_msgs(data, 'edit').then(res => {
            io.emit('message-edited', res)
        })
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

    socket.on('chat-for-preview', (data) => {
        // Получение данных о чатах (не только для превью, название сокетов врет)
        console.log("aboba")
        ChatUserDB.get_chat_info(data).then(res1 => {
            console.log("1");
            MessageDB.get_last_message(data).then(res2 => {
                console.log(res2)
                let userid = 0
                if (res2 != undefined) userid = res2.user_id
                AuthDB.get_name_surname({ "id": userid }).then(res3 => {
                    let res = {
                        "chat": res1,
                        "last_msg": {
                            "text": res2 == undefined ? "" : res2.text,
                            "user_id": res2 == undefined ? "" : res2.user_id,
                            "time": res2 == undefined ? "" : res2.updatedAt,
                            "userdata": res3
                        }
                    }
                    socket.emit('chat_preview_info', { 'stat': 'OK', 'data': res })
                })

            })
        })
            .catch(err =>
                socket.emit('chat_preview_info', { 'stat': 'ERR' }))
    })

    socket.on("chats", (data) => {
        // Получает ID всех чатов, в которых состоит пользователь
        ChatUserDB.get_user_chats({ "user_id": data.user_id }).then(res => {
            for (let i = 0; i < res.length; i++) {
                ChatUserDB.get_chat_info({ "chat_id": res[i], "user_id": data.user_id }).then(res1 => {
                    console.log("1");
                    MessageDB.get_last_message({ "chat_id": res[i], "user_id": data.user_id }).then(res2 => {
                        console.log(res2)
                        let userid = 0
                        if (res2 != undefined) userid = res2.user_id
                        AuthDB.get_name_surname({ "id": userid }).then(res3 => {
                            let ress = {
                                "chat": res1,
                                "last_msg": {
                                    "text": res2 == undefined ? "" : res2.text,
                                    "user_id": res2 == undefined ? "" : res2.user_id,
                                    "time": res2 == undefined ? "" : res2.createdAt,
                                    "userdata": res3
                                }
                            }
                            socket.emit('chat_preview_info', { 'stat': 'OK', 'data': ress })
                        })

                    })
                })
                // socket.emit('recieve-chats', {res})
            }
            console.log(res)
        }).catch(err => socket.emit('chat_preview_info', { 'stat': 'ERR' }))
    })

    socket.on("newMessage", (data) => {
        /*
        New massage handler
        */
        MessageDB.get_last_id_with_time().then(res2 => {
            AuthDB.get_name_surname({ "id": data.user_id }).then(res3 => {
                console.log("ABOBA")
                console.log(res2)
                io.emit('msg', {
                    'stat': 'OK',
                    'data': {
                        'id': parseInt(res2.id) + 1,
                        'user_id': data.user_id,
                        'text': data.text,
                        'chat_id': data.chat_id,
                        'attachments': data.attachments,
                        'deleted_user': false,
                        'deleted_all': false,
                        'edited': false,
                        'createdAt': res2.time,
                        'service': false,
                        'user_name': `${res3.name} ${res3.surname}`,
                        'user_pic_url': res3.pic_url
                    }
                })
            })
        }).catch(err => console.log(err))
        MessageDB.new_msg(data).then(res => { })
    })

    socket.on("get-msgs", (data) => {
        /*
        Получение сообщений чата
        */
        console.log("Messages requested")
        MessageDB.get_all_showing_msgs(data).then(res => {
            for (let i = 0; i < res.length; i++) {
                socket.emit("chat-message-recieve", { 'stat': 'OK', 'data': res[i] })
            }
        })
    })

    socket.on("get-users-by-school", (data) => {
        /*
        Получение списка пользователей из определенной школы
        */
        AuthDB.get_users_by_school(data).then(res => {
            socket.emit("get_users_school", res)
            console.log("sent")
        })
    })

    socket.on("chat-users", (data) => {
        ChatUserDB.get_chat_users(data).then(res => {
            socket.emit("recieve-chat-users", res)
        })
    })

})
module.exports = { io }