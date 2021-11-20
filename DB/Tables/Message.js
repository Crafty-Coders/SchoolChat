const { Message, sequelize, ERR, OK, PH, EM, NAME, PR, initialize } = require('../DB_init.js');
const { data_checker } = require('../DB_functions');

async function new_msg(data) {
    /**
     * data = {chat_id, user_id, text, attachments = {}}
     */
    const new_message = Message.create({
        chat_id: data.chat_id,
        user_id: data.user_id,
        text: data.text,
        attachments: data.attachments
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

async function get_all_showing_msgs(data) {
    /**
     * data = {chat_id}
     */
    let msgs = get_all_chat_msgs(data.chat_id);
    for (let i = 0; i < msgs.length; i++)
        if (msgs[i].deleted_all == true)
            msgs.splice(i, 1);
    return msgs;
}

async function get_all_chat_msgs(data) {
    /**
    * data = {chat_id}
    */
    let msgs = await Message.findAll({
        where: {
            chat_id: data.chat_id
        }
    });
    return msgs;
}

async function manage_msgs(data, flag) {
    /**
     * data = {msg_id, text, attachments}
     */
    switch (flag) {
        case "delete_all":
            await Message.update({ deleted_all: true }, {
                where: {
                    id: data.msg_id,
                }
            })
            return OK;
        case "delete_one":
            await Message.update({ deleted_user: true }, {
                where: {
                    id: data.msg_id,
                }
            });
            return OK;
        case "edit":
            await Message.update({
                text: data.text,
                attachments: data.attachments
            }, {
                where: {
                    id: data.msg_id
                }
            });
            return OK;
    }
}

module.exports = {
    new_msg, get_msgs_for_user, get_all_showing_msgs, get_all_chat_msgs, manage_msgs
}