const { ChatUser, Chat, ChatAdmin, sequelize, ERR, OK, PH, EM, NAME, PR, initialize, Auth, DATA } = require('../DB_init.js');
const { data_checker, check_exist, is_Admin } = require('../DB_functions');
const { MessageDB, AuthDB } = require('../DB_main.js');
const { create_service_msg } = require('./Message.js');
// const { MessageDB, AuthDB } = require('../DB_main.js');
const { CommandCompleteMessage } = require('pg-protocol/dist/messages');
const { password } = require('pg/lib/defaults');

async function get_user_chats(data) {
    /**
     * data = {user_id}
     */
    if (!data_checker(data, ["user_id"])) {
        return DATA;
    }
    if (!(await check_exist({ id: data.user_id }, "user"))) {
        return DATA;
    }

    let chats = await ChatUser.findAll({
        raw: true,
        attributes: ['chat_id'],
        where: {
            user_id: data.user_id,
        }
    });
    let res = [];
    for (let i = 0; i < chats.length; i++) {
        res.push(chats[i].chat_id)
    }
    return res
}

async function check_user_left_ch(data) {
    /**
     * data = {chat_id, user_id}
     */
    if (!data_checker(data, ["chat_id", "user_id"]))
        return DATA;
    if (!(await check_exist({ id: data.user_id }, "user")))
        return DATA;

    const stat = await ChatUser.findAll({
        raw: true,
        attributes: ['left'],
        where: {
            user_id: data.user_id,
            chat_id: data.chat_id
        }
    });
    return stat[stat.length - 1].left
}

async function get_chat_info(data) {
    /**
     * 
     * data = {chat_id, user_id(optional)}
     * 
     * returns {
     *      name: name
     *      admins: returns arrray of chat admins
     *      pic: returns picture url
     *      time: returns creation time
     *      creator: returns creator's id
     * }
     * 
     */

    try{
        console.log(data)
        if (!data_checker(data, ["chat_id"]))
            return DATA;

        if (!(await check_exist({ id: data.chat_id }, "chat")))
            return DATA;

        const chat = (await Chat.findAll({
            raw: true,
            where: {
                id: data.chat_id
            }
        }))[0];

        let admins = [];

        u = await ChatAdmin.findAll({
            raw: true,
            attributes: ['user_id'],
            where: {
                chat_id: data.chat_id
            }
        });

        let userLeft = false
        let read = true
        
        if (data.user_id) {
            userLeft = (await ChatUser.findAll({
                raw: true,
                where: {
                    chat_id: data.chat_id,
                    user_id: data.user_id
                }
            }))[0].left 
        }


        for (let i = 0; i < u.length; i++)
            admins.push(u[i].user_id);
        let name = chat.name
        dat = {
            id: chat.id,
            name: name,
            admins: admins,
            pic: chat.picture_url,
            time: chat.createdAt,
            creator: chat.creator,
            left: userLeft
        }

        return dat;
    } catch {
        return ERR;
    }
}

async function get_chat_users(data) {
    /**
     * data = {chat_id}
     */

    let users = await ChatUser.findAll({
        raw: true,
        attributes: ['user_id'],
        where: {
            chat_id: data.chat_id
        }
    })
    var done = []
    var res = []
    for (let i = 0; i < users.length; i++) {
        if (done.includes(users[i].users_id)) {
            continue
        }
        let u = await Auth.findAll({
            raw: true,
            attributes: ['class_id', 'createdAt', 'email', 'id', 'name', 'surname', 'phone', 'picture_url', 'school_id'],
            where: {
                id: users[i].user_id
            }
        })
        delete u.token
        delete u.password
        res.push(u)
        done.push(users[i].user_id)
    }
    
    return res
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
    if (!(await check_exist({ id: data.user_id }, "user")))
        return DATA;

    const user = (await Auth.findAll({
        raw: true,
        where: {
            id: data.user_id
        }
    }))[0]

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



async function manage_user(data, flag) {
    /**
     * data = {user_id, chat_id, requester_id}
     */
    if (!data_checker(data, ["chat_id", "user_id"]))
        return DATA;
    if (!(await check_exist({ id: data.user_id }, "user")) || !(await check_exist({ id: data.chat_id }, "chat")))
        return DATA;
    switch (flag) {
        case "add":
            if ((await Chat.findAll({ raw: true, where: { id: data.chat_id } }))[0].deleted)
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
            if (!(await check_exist({ id: data.requester_id }, "user")))
                return DATA;
            if (!is_Admin({ chat_id: data.chat_id, user_id: data.requester_id }))
                return PR;
        case "leave":
            if ((await ChatUser.findAll({
                raw: true, where: {
                    chat_id: data.chat_id,
                    user_id: data.user_id,
                    left: false
                }
            })) === 0)
                return DATA;
            await ChatUser.update({ left: true }, {
                where: {
                    user_id: data.user_id,
                    chat_id: data.chat_id
                }
            });
            await ChatAdmin.destroy({
                where: {
                    user_id: data.user_id,
                    chat_id: data.chat_id
                }
            });
            return OK;

        case "delete":
            await ChatUser.destroy({
                where: {
                    user_id: data.user_id,
                    chat_id: data.chat_id
                }
            });
            await ChatAdmin.destroy({
                where: {
                    user_id: data.user_id,
                    chat_id: data.chat_id
                }
            });
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

            if (!(await check_exist({ id: data.user_id }, "user")))
                return DATA;

            await Chat.create({
                name: data.name,
                creator: data.user_id,
                ph: data.ph
            });

            let chatss = await Chat.findAll({raw: true})
            let current_chat = chatss[chatss.length-1].id

            await ChatUser.create({
                user_id: data.user_id,
                chat_id: current_chat, 
                left: false
            });

            for(var i = 0; i < data.users.length; i++) {
                await ChatUser.create({
                    user_id: parseInt(data.users[i], 10),
                    chat_id: current_chat,
                    left: false
                })
            }

            await create_service_msg("Чат создан", current_chat)
            return OK;

        case "delete":
            if (!data_checker(data, ["chat_id", "user_id"]))
                return DATA;

            if (!(await check_exist({ id: data.user_id }, "user")) || !(await check_exist({ id: data.chat_id }, "chat")))
                return DATA;

            if ((await Chat.findAll({
                raw: true,
                where: {
                    id: data.chat_id,
                    creator: data.user_id
                }})).length === 0)
                return PR;

            await Chat.update({ deleted: true }, {
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

            if (!(await check_exist({ id: data.chat_id }, "chat")))
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

            if (!(await check_exist({ id: data.chat_id }, "chat")))
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
    if (!(await check_exist({ id: data.user_id }, "user")) || !(await check_exist({ id: data.chat_id }, "chat")) || !(await check_exist({ id: data.requester_id }, "user")))
        return DATA;
    switch (flag) {
        case "create":
            if (await is_Admin(data))
                return OK;

            if (!(await is_Admin({ chat_id: data.chat_id, user_id: data.requester_id })))
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

            if (!(await is_Admin({ chat_id: chat_id, user_id: data.requester_id })))
                return PR;

            await ChatAdmin.destroy({
                where: {
                    chat_id: data.chat_id,
                    user_id: data.user_id
                }
            })
            return OK;
    }
}

module.exports = {
    manage_chat, manage_user, get_user_info, 
    get_chat_info, check_user_left_ch, get_user_chats, 
    manage_admin, check_exist, get_chat_users
}