import { ChatUser, Chat, ChatAdmin, sequelize, ERR, OK, PH, EM, NAME, PR, initialize, Auth } from '../DB_init.js';


async function get_user_chats(user_id) {
    try {
        let chats = await ChatUser.findAll({
            attributes: ['chat_id'],
            where: {
                user_id: user_id
            }
        });
        for(let i = 0; i<chats.length; i++){
            try {
                let ch = (await Chat.findAll({where: {
                    id: chats.chat_id,
                    deleted: 0
                }})).length
                if (ch == 0)
                    chats.splice(i, 1);
            } catch {
                continue;
            }
        }
        return chats;
    } catch {
        return [];
    }
}

async function check_user_left_ch(chat_id, user_id) {
    try {
        const stat = await ChatUser.findAll({attributes: ['left'], where: {
            user_id: user_id,
            chat_id: chat_id
        }});
        return stat[0] == 0 ? false : true    
    } catch {
        return false;
    }
}

async function get_chat_info(chat_id) {
    /**
     * 
     * returns{
     *      users: returns array of chat users
     *      name: name
     *      admins: returns arrray of chat admins
     *      pic: returns picture url
     *      time: returns creation time
     *      creator: returns creator's id
     * }
     * 
     */
    try {
        const chat = (await Chat.findAll({where: {
            id: chat_id
        }}))[0];
        const u = await ChatUser.findAll({attributes: ['user_id'], where: {
            chat_id: chat_id,
            left: 0
        }});
        let users = [];
        for (let i = 0; i<u.length; i++)
            users.push(u[i].user_id);
        u = await ChatAdmin.findAll({attributes: ['user_id'], where: {
            chat_id: chat_id
        }})
        let admins = [];
        for (let i = 0; i<u.length; i++)
            admins.push(u[i].user_id)
            
        return {
            users: users,
            name: chat.name,
            admins: admins,
            pic: chat.picture_url,
            time: 1,
            creator: chat.creator
        };
    } catch {
        return {};
    }
}

async function get_user_info(user_id) {
    /**
     * returns {
     *      name,
     *      surname,
     *      school_id,
     *      cls_id,
     *      email,
     *      phone,
     *      pic
     * }
     */
    const user = (await Auth.findAll({where: {
        id: user_id
    }}))[0]

    return {
        name: user.name,
        surname: user.surname,
        school_id: user.school_id,
        class_id: user.class_id,
        email: user.email,
        phone: user.phone,
        pic: user.picture_url
    }
}

async function manage_user(user_id, chat_id, flag) {
    switch (flag) {
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
                await ChatUser.update({ left: 1 }, {
                    where: {
                        user_id: user_id,
                        chat_id: chat_id
                    }
                });
                await ChatAdmin.destroy({where: {
                    user_id: user_id,
                    chat_id: chat_id
                }});
                return OK;
            } catch {
                return ERR;
            }
        case "delete":
            try {
                await ChatUser.destroy({where: {
                    user_id: user_id,
                    chat_id: chat_id
                }});
                await ChatAdmin.destroy({where: {
                    user_id: user_id,
                    chat_id: chat_id
                }});
                return OK;
            } catch {
                return ERR;
            }
    }
}

async function manage_chat(name, user_id, chat_id, ph, flag) {
    switch (flag) {
        case "create":
            if (user_id == undefined)
                return ERR;
            if (name == undefined)
                return NAME;
            try {
                const new_chat = await Chat.create({
                    name: name,
                    creator: user_id
                });
                await new_chat.save();
                return OK;
            } catch {
                return ERR;
            }
        case "delete":
            const admins_len = (await ChatAdmin.findAll({
                where: {
                    user_id: user_id,
                    chat_id: chat_id
                }
            })).length;
            const creator_len = (await Chat.findAll({
                where: {
                    id: chat_id,
                    creator: user_id
                }
            })).length;
            if ((creator_len + admins_len) == 0)
                return PR;
            try {
                await Chat.update({deleted: 1}, {
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
                await Chat.update({ name: name }, {
                    where: {
                        id: chat_id
                    }
                });
                return OK;
            } catch {
                return ERR;
            }
        case "photo":
            try {
                await Chat.update({ picture_url: ph }, {
                    where: {
                        id: chat_id
                    }
                });
                return OK;
            } catch {
                return ERR;
            }
    }
}

module.exports = {
    manage_chat, manage_user, get_user_info, get_chat_info, check_user_left_ch, get_user_chats
}