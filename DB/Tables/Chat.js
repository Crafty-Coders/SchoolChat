import { ChatUser, Chat, ChatAdmin, sequelize, ERR, OK, PH, EM, NAME, PR, initialize } from '../DB_init.js';


async function get_user_chats(user_id) {
    try {
        let chats = await ChatUser.findAll({
            attributes: ['chat_id'],
            where: {
                user_id: user_id
            }
        });
        // TODO: Check chats, delete from array if chat doesn't exist
        return chats;
    } catch {
        return [];
    }
}

async function get_chat_info(chat_id) {
    /**
     * 
     * returns{
     *      users: returns array of chat users
     *      admins: returns arrray of chat admins
     *      pic: returns picture url
     *      time: returns creation time
     *      creator: returns creator's id
     * }
     * 
     */
    // TODO: create function!
}

async function manage_user(user_id, chat_id, flag) {
    switch (flag){
        case "add":
            try {
                const new_row = await ChatUser.create({
                    user_id: user_id,
                    chat_id: chat_id
                });
                await new_row.save();
                return OK;
            }
            catch {
                return ERR;
            }
        case "leave":
            try {
                await ChatUser.destroy({
                    where: {
                        user_id: user_id,
                        chat_id: chat_id
                    }
                });
                return OK;
            } catch {
                return ERR;
            }
    }
}

async function manage_chat(name, user_id, chat_id, flag) {
    switch (flag){
        case "create":
            if (user_id == undefined)
                return ERR;
            if (name == undefined)
                return NAME;
            try {
                date = new Date();
                const new_chat = await Chat.create({
                    name: name,
                    creator: user_id,
                    creation_time: date.toLocaleString()
                });
                await new_chat.save();
                return OK;
            } catch {
                return ERR;
            }
        case "delete":
            let premission = false;
            const admins = (await ChatAdmin.findAll({where: {
                user_id: user_id,
                chat_id: chat_id
            }})).length;
            const creator = (await Chat.findAll({where: {
                id: chat_id,
                creator: user_id
            }})).length;
            premission = (creator != 0) || (admins != 0);
            if (!premission)
                return PR;
            try {
                await Chat.destroy({
                    where: {
                        id: chat_id
                    }
                });
                await ChatUser.destroy({
                    where: {
                        chat_id: chat_id
                    }
                });
                return OK;
            } catch {
                return ERR;
            }
        case "rename":
            if (name == undefined)
                return NAME;
            try {
                await Chat.update({ name: name }, {where: {
                    id: chat_id
                }});
                return OK;
            } catch {
                return ERR;
            }
    }
}