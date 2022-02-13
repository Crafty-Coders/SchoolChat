const { Message, sequelize, ERR, OK, PH, EM, NAME, PR, initialize, DATA } = require('../DB_init.js');
const { data_checker, propper, check_exist, is_Admin, msg_checker } = require('../DB_functions.js');
const AuthDB = require('../Tables/Auth');

async function new_msg(data) {
    /**
     * data = {chat_id, user_id, text, attachments = {}}
     */
    if (!data_checker(data, ["chat_id", "user_id"]) || ((data.attachments == undefined || data.attachments == {}) && data.text == undefined))
        return DATA;
    data = propper(data, ["text"]);
    if (!(await check_exist({ id: data.user_id }, "user")) || !(await check_exist({ id: data.chat_id }, "chat")))
        return DATA;
    data.attachments = data.attachments == undefined ? {} : data.attachments;
    data.text = msg_checker(data.text);
    if (data.text == "" || data.text == undefined)
        return DATA;
    let user = await AuthDB.get_name_surname({ "id": data.user_id })
    let user_name = `${user.name} ${user.surname}`
    const new_message = await Message.create({
        chat_id: data.chat_id,
        user_id: data.user_id,
        text: data.text,
        attachments: data.attachments,
        user_name: user_name,
        user_pic_url: user.pic_url
    });
    await new_message.save();
    return OK;
}

async function get_msgs_for_user(data) {
    /**
     * data = {chat_id, user_id}
     */
    msgs = get_all_showing_msgs(data.chat_id);
    for (let i = 0; i < msgs.length; i++)
        if ((msgs[i].user_id == data.user_id) && (msgs[i].deleted_user == true))
            msgs.splice(i, 1);
    return msgs;
}

async function create_service_msg(text, chat_id) {
    await Message.create({
        chat_id: chat_id,
        user_id: 0,
        text: text,
        attachments: {},
        service: true,
    })
}

async function get_all_showing_msgs(data) {

    /**
     * data = {chat_id}
     */
    try {
        let msgs = await Message.findAll({
            raw: true,
            where: {
                chat_id: parseInt(data.chat_id),
                deleted_all: false
            },
            order: [
                ['id', 'ASC']
            ]
        });
        return msgs;
    } catch (e) {
        return [];
    }
}

async function get_all_msgs_for_site(chat_id) {
    let msgs = await Message.findAll({
        raw: true,
        attributes: [['id', 'id_msg'], ['chat_id', 'id_chat'], 'user_id', 'user_name', 'text', 'service', 'attachments', 'deleted_all', 'deleted_user', 'edited', ['updatedAt', 'data']],
        where: {
            chat_id: chat_id,
            deleted_all: false
        },
        order: [
            ['id', 'ASC']
        ]
    })
    return msgs
}

async function has_read(data) {
    /* 
    data = {user_id, message_id}
    */
}

async function get_all_chat_msgs(data) {
    /**
* data = {chat_id, user_id} // !
    */
    if (!data_checker(data, ["chat_id"]))
        return DATA;
    if (!(await check_exist({ id: data.chat_id }, "chat")))
        return DATA;
    let msgs = await Message.findAll({
        raw: true,
        where: {
            chat_id: parseInt(data.chat_id)
        },
        order: [
            ['id', 'ASC']
        ]
    });
    return msgs;
}

async function get_last_message(data) {
    let msgs = await Message.findAll({
        raw: true,
        limit: 1,
        where: {
            chat_id: parseInt(data.chat_id),
            deleted_all: false
        },
        order: [
            ['id', 'DESC']
        ]
    });
    return msgs[0]
}

async function manage_msgs(data, flag) {
    /**
     * data = {msg_id, text, requester_id, attachments}
     */
    if (!data_checker(data, ["msg_id"]))
        return { 'stat': 'ERR' }
    switch (flag) {
        case "delete_all":
            if (!data_checker(data, ["requester_id"]))
                return { 'stat': 'ERR' }
            if ((await is_Admin({
                chat_id: (await Message.findAll({
                    raw: true,
                    attributes: ["chat_id"],
                    where: { id: data.msg_id }
                }))[0].chat_id, user_id: data.requester_id
            }))
                || (await Message.findAll({
                    raw: true, where: {
                        id: data.msg_id,
                        user_id: data.requester_id
                    }
                })).length != 0) {
                await Message.update({ deleted_all: true }, {
                    where: {
                        id: data.msg_id,
                    }
                })
                return {
                    'stat': 'OK', 'data': {
                        id: data.msg_id
                    }
                }
            }
            return { 'stat': 'ERR' }
        case "delete_one":
            await Message.update({ deleted_user: true }, {
                where: {
                    id: data.msg_id,
                }
            });
            return {
                'stat': 'OK', 'data': {
                    id: data.msg_id
                }
            }
        case "edit":
            if (!data_checker(data, ["requester_id"]) || ((data.attachments == undefined || data.attachments == {}) && (data.text == undefined || data.text == "")))
                return { 'stat': 'ERR' }
            data = propper(data, ["text"]);
            data.attachments = data.attachments == undefined ? {} : data.attachments;
            if ((await Message.findAll({
                raw: true, where: {
                    id: data.msg_id,
                    user_id: data.requester_id
                }
            })).length == 0)
                return { 'stat': 'ERR' }
            data.text = msg_checker(data.text);
            if (data.text == "" || data.text == undefined)
                return { 'stat': 'ERR' }
            await Message.update({
                text: data.text,
                attachments: data.attachments
            }, {
                where: {
                    id: data.msg_id
                }
            });
            let new_message = (await Message.findAll({
                raw: true,
                where: {
                    id: data.msg_id
                },
                limit: 1
            }))[0]
            return {
                'stat': 'OK',
                'data': new_message
            }
    }
}

async function get_last_id_with_time() {
    let msgs = await Message.findAll({
        raw: true,
        limit: 1,
        order: [
            ['id', 'DESC']
        ]
    });
    let id = msgs[0].id
    let time = msgs[0].updatedAt
    return {
        'id': id,
        'time': time
    }
}

module.exports = {
    new_msg, get_msgs_for_user, get_all_showing_msgs, get_all_chat_msgs, manage_msgs, get_last_message, get_last_id_with_time, create_service_msg, get_all_msgs_for_site
}