import { Message, sequelize, ERR, OK, PH, EM, NAME, PR, initialize } from '../DB_init.js';

async function new_msg(chat_id, user_id, text, attachments={}) {
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

async function get_msgs(chat_id) {
    try {
        let msgs = await Message.findAll({where: {
            chat_id: chat_id
        }});
        return msgs;
    } catch {
        return ERR;
    }
} 

async function manage_msgs(msg_id, param){
}