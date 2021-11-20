const { ChatUser, Chat, ChatAdmin, sequelize, ERR, OK, PH, EM, NAME, PR, initialize, Auth, DATA } = require('../DB_init.js');
const { data_checker } = require('../DB_functions');

async function get_user_chats(data) {
    /**
     * data = {user_id}
     */
    if (!data_checker(data, ["user_id"]))
        return DATA;
    if (!(await check_exist({id: data.user_id}, "user")))
        return DATA;

    let chats = await ChatUser.findAll({
        attributes: ['chat_id'],
        where: {
            user_id: data.user_id
        }
    });
    for(let i = 0; i<chats.length; i++){
        try {
            let ch = (await Chat.findAll({
                raw: true,
                where: {
                    id: chats.chat_id,
                    deleted: false
            }})).length
            if (ch == 0)
                chats.splice(i, 1);
        } catch { continue; }
    }
    let res = [];
    for (var chat in chats)
        res.push(chats[chat].chat_id)
    return [...new Set(res)];
}

async function check_user_left_ch(data) {
    /**
     * data = {chat_id, user_id}
     */
    if (!data_checker(data, ["chat_id", "user_id"]))
        return DATA;
    if (!(await check_exist({id: data.user_id}, "user")))
        return DATA;

    const stat = await ChatUser.findAll({
        raw: true, 
        attributes: ['left'], 
        where: {
            user_id: data.user_id,
            chat_id: data.chat_id
    }});
    return stat[stat.length-1].left  
}

async function get_chat_info(data) {
    /**
     * 
     * data = {chat_id}
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
    if (!data_checker(data, ["chat_id"]))
        return DATA;

    if (!(await check_exist({id: data.chat_id}, "chat")))
        return DATA;

    const chat = (await Chat.findAll({
        raw: true,
        where: {
            id: data.chat_id
    }}))[0];
    let u = await ChatUser.findAll({
        raw: true,
        attributes: ['user_id'], 
        where: {
            chat_id: data.chat_id,
            left: false
    }});
    let users = [];
    for (let i = 0; i<u.length; i++)
        users.push(u[i].user_id);
    let admins = [];

    u = await ChatAdmin.findAll({
        raw: true,
        attributes: ['user_id'],
        where: {
            chat_id: data.chat_id
    }});
    
    for (let i = 0; i<u.length; i++)
        admins.push(u[i].user_id);
        
    return {
        id: chat.id,
        users: users,
        name: chat.name,
        admins: admins,
        pic: chat.picture_url,
        time: chat.createdAt,
        creator: chat.creator
    };
}

async function get_user_info(data) {
    /**
     * 
     * data = {user_id}
     * 
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
    if (!data_checker(data, ["user_id"]))
        return DATA;
    if (!(await check_exist({id: data.user_id}, "user")))
        return DATA;
    
    const user = (await Auth.findAll({
        raw: true,
        where: {
            id: data.user_id
    }}))[0]

    return {
        id: user.id,
        name: user.name,
        surname: user.surname,
        school_id: user.school_id,
        class_id: user.class_id,
        email: user.email,
        phone: user.phone,
        pic: user.picture_url
    }
}

async function check_exist(data, type) {
    /** 
     * data = {id}
     */
    if (data.id == undefined)
        return false;
    switch(type) {
        case "chat": 
            return !((await Chat.findAll({raw: true, where: {id: data.id}})).length == 0)
        case "user":
            return !((await Auth.findAll({raw: true, where: {id: data.id}})).length == 0)
    }
}

async function is_Admin(data){
    /**
     * data = {chat_id, user_id}
     */
    if (!data_checker(data, ["user_id", "chat_id"]))
        return false;
    return ((await ChatAdmin.findAll({raw: true, where: {
        chat_id: data.chat_id,
        user_id: data.user_id
    }})) != 0 || (await Chat.findAll({raw: true, where: {
        id: data.chat_id,
        creator: data.user_id
    }})) != 0)
}

async function manage_user(data, flag) {
    /**
     * data = {user_id, chat_id, requester_id}
     */
    if (!data_checker(data, ["chat_id", "user_id"]))
        return DATA;
    if (!(await check_exist({id: data.user_id}, "user")) || !(await check_exist({id: data.chat_id}, "chat")))
        return DATA;
    switch (flag) {
        case "add":
            if ((await Chat.findAll({raw: true, where: {id: data.chat_id}}))[0].deleted)
                return DATA;

            const new_row = await ChatUser.create({
                user_id: data.user_id,
                chat_id: data.chat_id
            });
            await new_row.save();
            return OK;

        case "kick":
            if (data.requester_id == undefined)
                return DATA;
            if (!(await check_exist({id: data.requester_id}, "user")))
                return DATA;
            if (!is_Admin({chat_id: data.chat_id, user_id: data.requester_id}))
                return PR;
        case "leave":
            if ((await ChatUser.findAll({raw: true, where: {
                chat_id: data.chat_id,
                user_id: data.user_id,
                left: false
                }})) == 0)
                return DATA;
            await ChatUser.update({ left: true }, {
                where: {
                    user_id: data.user_id,
                    chat_id: data.chat_id
                }
            });
            await ChatAdmin.destroy({where: {
                user_id: data.user_id,
                chat_id: data.chat_id
            }});
            return OK;

        case "delete":
            await ChatUser.destroy({where: {
                user_id: data.user_id,
                chat_id: data.chat_id
            }});
            await ChatAdmin.destroy({where: {
                user_id: data.user_id,
                chat_id: data.chat_id
            }});
            return OK;
    }
}

async function manage_chat(data, flag) {
    /**
     * data = {name, user_id, chat_id, ph}
     */
    switch (flag) {
        case "create":
            if (!data_checker(data, ["name", "user_id"]))
                return DATA;
            if (!(await check_exist({id: data.user_id}, "user")))
                return DATA;
            const new_chat = await Chat.create({
                name: data.name,
                creator: data.user_id,
                ph: data.ph
            });
            await new_chat.save();
            return OK;

        case "delete":
            if (!data_checker(data, ["chat_id", "user_id"]))
                return DATA;
            if (!(await check_exist({id: data.user_id}, "user")) || !(await check_exist({id: data.chat_id}, "chat")))
                return DATA;
            if ((await Chat.findAll({
                raw: true,
                where: {
                    id: data.chat_id,
                    creator: data.user_id
                }
                })).length == 0)
                return PR;

            await Chat.update({deleted: true}, {
                where: {
                    id: data.chat_id
                }
            });
            await ChatUser.destroy({
                where: {
                    chat_id: data.chat_id
                }
            });
            return OK;

        case "rename":
            if (!data_checker(data, ["chat_id", "name"]))
                return DATA;
            if (!(await check_exist({id: data.chat_id}, "chat")))
                return DATA;
            await Chat.update({ name: data.name }, {
                where: {
                    id: data.chat_id
                }
            });
            return OK;
        case "photo":
            if (!data_checker(data, ["chat_id", "ph"]))
                return DATA;
            if (!(await check_exist({id: data.chat_id}, "chat")))
                return DATA;
            await Chat.update({ picture_url: data.ph }, {
                where: {
                    id: data.chat_id
                }
            });
            return OK;
    }
}

async function manage_admin(data, flag) {
    /**
     * data = {user_id, chat_id, requester_id}
     */
    if (!data_checker(data, ["chat_id", "user_id", "requester_id"]))
        return DATA;
    if (!(await check_exist({id: data.user_id}, "user")) || !(await check_exist({id: data.chat_id}, "chat")) || !(await check_exist({id: data.requester_id}, "user")) )
        return DATA;
    switch (flag) {
        case "create":
            if (await is_Admin(data))
                return OK;
            if (!(await is_Admin({chat_id: data.chat_id, user_id: data.requester_id})))
                return PR;
            const new_admin = await ChatAdmin.create({
                user_id: data.user_id,
                chat_id: data.chat_id,
                creator_id: data.requester_id
            })
            await new_admin.save();
            return OK;
        case "delete":
            if (!(await is_Admin(data)))
                return OK;
            if (!(await is_Admin({chat_id: chat_id, user_id: data.requester_id})))
                return PR;
            await ChatAdmin.destroy({where: {
                chat_id: data.chat_id,
                user_id: data.user_id
            }})
            return OK;
    }
}

module.exports = {
    manage_chat, manage_user, get_user_info, get_chat_info, check_user_left_ch, get_user_chats, manage_admin
}