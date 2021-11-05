import { Auth, sequelize, ERR, OK, PH, EM, initialize } from '../DB_init.js';

async function add_user_to_chat(data){
    try{
        const new_row = await DB_init.ChatUser.create({
            user_id: data.user_id,
            chat_id: data.chat_id
        });
        await new_row.save();
        return OK;
    }
    catch{
        return ERR;
    }
}

async function get_user_chats(data){
    try{
        let chats = await DB_init.ChatUser.findAll({
            attributes: ['chat_id'],
            where: {
                user_id: data.user_id
            }
        });
        return chats;
    } catch {
        return [];
    }
}

async function leave_chat(data){
    try{
        await DB_init.ChatUser.destroy({
            where: {
                user_id: data.user_id,
                chat_id: data.chat_id
            }
        });
        return OK;
    } catch {
        return ERR;
    }
}

async function create_chat(data){
    try{
        if (!data.admins)
            let admins = "";
        else 
            let admins = data.admins;
        date = new Date();
        const new_chat = await DB_init.Chat.create({
            creator: data.user_id,
            admins: admins,
            creation_time: date.toLocaleString()
        });
        return OK;
    } catch {
        return ERR;
    }
}