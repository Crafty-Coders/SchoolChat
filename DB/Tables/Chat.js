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

async function get_chat_info(chat_id){
    /**
     * 
     * returns{
     *      users: returns array of chat users
     *      admins: returns arrray of chat admins
     *      pic: returns 1 element array with picture url
     *      time: returns 1 element array with creation time
     *      creator: returns 1 element array with chat creator's id
     * }
     * 
     */
    // TODO: create function!
}

// TODO: create function manage_user(user_id, chat_id) to delete and add user instead of 2 func delete(add)_user_from_chat() 
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