import { Message, sequelize, ERR, OK, PH, EM, NAME, PR, initialize } from '../DB_init.js';

async function new_msg(chat_id, user_id, text, attachments = {}) {
    try {
        const new_message = Message.create({
            chat_id: chat_id,
            user_id: user_id,
            text: text,
            attachments: attachments
        });
        await new_message.save();
        return OK;
    } catch {
        return ERR;
    }
}

async function get_msgs_for_user(chat_id, user_id) {
    msgs = get_all_showing_msgs(chat_id);
    for (let i = 0; i < msgs.length; i++)
        if ((msgs[i].user_id == user_id) && (msgs[i].deleted_user == 1))
            msgs.splice(i, 1);
    return msgs;
}

async function get_all_showing_msgs(chat_id) {
    let msgs = get_all_chat_msgs(chat_id);
    for (let i = 0; i < msgs.length; i++)
        if (msgs[i].deleted_all == 1)
            msgs.splice(i, 1);
    return msgs;
}

async function get_all_chat_msgs(chat_id) {
    try {
        let msgs = await Message.findAll({
            where: {
                chat_id: chat_id
            }
        });
        return msgs;
    } catch {
        return ERR;
    }
}

async function manage_msgs(msg_id, param, text, attachments) {
    switch (param) {
        case "delete_all":
            try {
                await Message.update({ deleted_all: 1 }, {
                    where: {
                        id: msg_id,
                    }
                })
                return OK;
            } catch {
                return ERR;
            }
        case "delete_one":
            try {
                await Message.update({ deleted_user: 1 }, {
                    where: {
                        id: msg_id,
                    }
                });
                return OK;
            } catch {
                return ERR;
            }
        case "edit":
            try {
                await Message.update({
                    text: text,
                    attachments: attachments
                }, {
                    where: {
                        id: msg_id
                    }
                });
                return OK;
            } catch {
                return ERR;
            }
    }
}

module.exports = {
    new_msg, get_msgs_for_user, get_all_showing_msgs, get_all_chat_msgs, manage_msgs
}