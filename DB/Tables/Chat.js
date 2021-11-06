import { ChatUser, Chat, sequelize, ERR, OK, PH, EM, initialize } from '../DB_init.js';

async function add_user_to_chat(user_id, chat_id){
    try{
        const new_row = await ChatUser.create({
            user_id: user_id,
            chat_id: chat_id
        });
        await new_row.save();
        return OK;
    }
    catch{
        return ERR;
    }
}

async function get_user_chats(user_id){
    try{
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
// TODO: create functions below!
async function get_chat_name(chat_id){

}

async function get_chat_users(chat_id){

}

async function get_chat_admins(chat_id){

}

async function delete_user_from_chat(user_id, chat_id){
    try{
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

async function create_chat(user_id, admins = ""){
    try{
        date = new Date();
        const new_chat = await Chat.create({
            creator: user_id,
            admins: admins,
            creation_time: date.toLocaleString()
        });
        await new_chat.save();
        return OK;
    } catch {
        return ERR;
    }
}

async function delete_chat(chat_id){
    try{
        await Chat.destroy({where: {
            id: chat_id
        }});
        await ChatUser.destroy({where: {
            chat_id: chat_id
        }});
        return OK;
    } catch {
        return ERR;
    }
}