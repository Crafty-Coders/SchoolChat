const { Auth, sequelize, ERR, OK, PH, EM, PASS, DATA, initialize, Sequelize, Message, Chat, Class, ChatUser } = require('../DB_init.js');
const { data_checker, propper, to_int, generate_token } = require('../DB_functions');


async function register(data) {
    /**
     * data = {name, surname, school_id, class_id, email, phone, password, picture_url} email or phone!
     */

    let isp = (await Auth.findAll({
        where: {
            phone: data.phone
        }
    })).length;

    let ise = (await Auth.findAll({
        where: {
            email: data.email
        }
    })).length;

    let ClassData = await Class.findAll({
        raw: true,
        limit: 1,
        where: {
            invite_code: data.invite_code
        }
    })

    if (ClassData.length == 0) {
        return { 'stat': "CODE" }
    }

    let class_id = ClassData[0].id
    let school_id = ClassData[0].school_id

    let token = await generate_token()
    console.log("TOKEN GENERATED");
    await Auth.create({
        name: data.name,
        surname: data.surname,
        school_id: school_id,
        class_id: class_id,
        email: data.email,
        phone: data.phone,
        password: data.password,
        token: token
    });

    const class_chats = await Chat.findAll({
        raw: true,
        where: {
            class_id: class_id
        }
    })

    const new_user_id = (await Auth.findAll({
        raw: true,
        limit: 1,
        where: {
            name: data.name,
            surname: data.surname,
        },
        order: [
            ['id', 'DESC']
        ]
    }))[0].id

    for (let i = 0; i < class_chats.length; i++) {
        await ChatUser.create({
            user_id: new_user_id,
            chat_id: class_chats[i].id,
            left: false
        })
    }

    let user = (await Auth.findAll({
        where: {
            id: new_user_id
        },
        attributes: ['id', 'name', 'surname', 'school_id', 'class_id', 'email', 'phone', 'picture_url', 'token'],
        limit: 1
    }))[0]

    return { 'stat': 'OK', 'data': user };
}

async function auth(data) {
    /**
     * data = {token}
     * returns {USER}
     */
    let user = await Auth.findAll({
        raw: true,
        where: {
            token: data.token
        }
    })
    if (user.length == 0) {
        return {}
    }
    return {
        'id': user[0].id,
        'name': user[0].name,
        'surname': user[0].surname,
        'school_id': user[0].school_id,
        'class_id': user[0].class_id,
        'email': user[0].email,
        'phone': user[0].phone
    }
}

async function login(data) { // Default values are highlighted with #__#
    /**
     * data = {email, phone, password} email or phone!
     */
    if (!data_checker(data, ["password"]) || (data.phone == undefined && data.email == undefined))
        return PASS;

    data = propper(data, ["phone", "email"]);
    let logins = await Auth.findAll({
        raw: true,
        where: {
            [Sequelize.Op.or]: [
                { phone: data.phone },
                { email: data.email }
            ]
        }
    });
    for (let i = 0; i < logins.length; i++) {
        if (logins[i].password == data.password)
            return {
                'user': await auth({ 'token': logins[i].token }),
                'token': logins[i].token
            };
    }
    return PASS;
}

async function getAuthData(data) {
    let users = await Auth.findAll({
        raw: true,
        where: {
            [Sequelize.Op.or]: [
                { phone: data.data },
                { email: data.data }
            ]
        }
    })
    if (users.length != 0) {
        return {
            'stat': 'OK',
            'data': users[0]
        }
    } else {
        return {
            'stat': 'ERR'
        }
    }
}

async function getAuthDataId(id) {
    let users = await Auth.findAll({
        raw: true,
        where: {
            id: id
        }
    })
    if (users.length == 0) {
        return null
    }
    return users[0]
}

async function change_password(data) {
    /**
     * data = {email, phone, password, new_password} email or phone!
     */
    if (!data_checker(data, ["password", "new_password"]) || (data.email == undefined && data.phone == undefined))
        return DATA;

    data = propper(data, ["phone", "email"]);
    let login_stat = await login(data);
    if (login_stat != OK)
        return login_stat;
    let new_token = await generate_token()
    await Auth.update({ password: data.new_password, token: new_token }, {
        where: {
            [Sequelize.Op.or]: [
                { phone: data.phone },
                { email: data.email }
            ]
        }
    });
    return OK;
}

async function get_name_surname(data) {
    console.log(data)
    if (data.id == 0)
        return {
            name: "",
            surname: ""
        }
    if (!data_checker(data, ["id"]))
        return DATA;
    console.log(data)
    let res = await Auth.findAll({
        raw: true,
        where: {
            id: parseInt(data.id)
        }
    })
    console.log(res)
    if (res.length == 0) {
        return {
            id: 0,
            name: "",
            surname: "",
            pic_url: ""
        }
    } 
    return {
        id: data.id || 0,
        name: res[0].name || "",
        surname: res[0].surname || "",
        pic_url: res[0].picture_url == undefined ? "" : res[res.length - 1].picture_url
    }
}

async function get_users_by_school(data) {
    let res = await Auth.findAll({
        raw: true,
        where: {
            school_id: data.school_id
        }
    })
    let ret = []
    for (let i = 0; i < res.length; i++) {
        ret.push({
            'id': res[i].id,
            'name': res[i].name,
            'surname': res[i].surname,
            'school_id': res[i].school_id,
            'class_id': res[i].class_id,
            'email': res[i].email,
            'phone': res[i].phone
        })
    }
    return { 'stat': 'OK', 'data': ret }
}

async function change_name_surname(data) {
    /**
     * data = {id, name or surname}
     */

    if (data.surname != undefined && data.name != undefined) {
        await Auth.update({ name: data.name, surname: data.surname }, {
            where: {
                id: data.id
            }
        });
    }
    else if (data.name != undefined) {
        await Auth.update({ name: data.name }, {
            where: {
                id: data.id
            }
        });
    }
    else if (data.surname != undefined) {
        await Auth.update({ surname: data.surname }, {
            where: {
                id: data.id
            }
        });
    }

    let user = await get_name_surname({ "id": data.id })

    await Message.update({ user_name: `${user.name} ${user.surname}`, user_pic_url: user.pic_url }, {
        where: {
            user_id: data.id
        }
    })
}

module.exports = {
    register, login, change_password,
    get_name_surname, get_users_by_school, auth, change_name_surname, getAuthData, getAuthDataId
}