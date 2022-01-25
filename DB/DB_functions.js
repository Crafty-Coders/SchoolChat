const { Chat, Auth, ChatAdmin } = require('./DB_init.js');

function to_int(d) {
    return d == '' ? 0 : parseInt(d);
}

function data_checker(data, props) {
    for (var prop in props)
        if (data[props[prop]] == undefined)
            return false;
    return true;
}

function propper(data, props) {
    for (var prop in props)
        data[props[prop]] = data[props[prop]] == undefined ? '' : data[props[prop]];
    return data;
}

async function check_exist(data, type) {
    /** 
     * data = {id}
     */
    if (data.id == undefined)
        return false;
    switch (type) {
        case "chat":
            // ! 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 - THE BEST BUG IN MY LIFE
            return !((await Chat.findAll({ raw: true, where: { id: data.id } })).length === 0)
        case "user":
            return !((await Auth.findAll({ raw: true, where: { id: data.id } })).length === 0)
    }
}

async function is_Admin(data) {
    /**
     * data = {chat_id, user_id}
     */
    if (!data_checker(data, ["user_id", "chat_id"]))
        return false;
    return ((await ChatAdmin.findAll({
        raw: true, where: {
            chat_id: data.chat_id,
            user_id: data.user_id
        }
    })) !== 0 || (await Chat.findAll({
        raw: true, where: {
            id: data.chat_id,
            creator: data.user_id
        }
    })) !== 0)
}

function msg_checker(str) {
    function ltrim(str) {
        if(!str) return str;
        return str.replace(/^\s+/g, '');
      }
    function rtrim(str) {
        if(!str) return str;
        return str.replace(/\s+$/g, '');
      }
    return rtrim(ltrim(str));
}

module.exports = {
    data_checker, propper, check_exist, is_Admin, msg_checker, to_int
}