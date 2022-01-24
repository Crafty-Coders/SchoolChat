const { Auth, sequelize, ERR, OK, PH, EM, PASS, DATA, initialize, Sequelize } = require('../DB_init.js');
const { data_checker, propper } = require('../DB_functions');

function to_int(d) {
    return d == '' ? 0 : parseInt(d);
}

async function register(data) {
    /**
     * data = {name, surname, school_id, class_id, email, phone, password, picture_url} email or phone!
     */
    if (!data_checker(data, ["name", "surname", "password"]) || (data.email == undefined && data.phone == undefined))
        return DATA;

    data = propper(data, ["name", "surname", "school_id", "class_id", "email", "phone", "password", "picture_url"]);

    let isp = (await Auth.findAll({
        where: {
            phone: data.phone
        }
    })).length;

    if (isp != 0 && data.phone != "")
        return PH;
    let ise = (await Auth.findAll({
        where: {
            email: data.email
        }
    })).length;

    if (ise != 0 && data.email != "")
        return EM;

    const new_user = await Auth.create({
        name: data.name,
        surname: data.surname,
        school_id: to_int(data.school_id),
        class_id: to_int(data.class_id),
        email: data.email,
        phone: data.phone,
        password: data.password,
        picture_url: data.picture_url
    });
    await new_user.save();
    return OK;
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
        attributes: ['password'],
        where: {
            [Sequelize.Op.or]: [
                { phone: data.phone },
                { email: data.email }
            ]
        }
    });
    for (let i = 0; i < logins.length; i++) {
        if (logins[i].password == data.password)
            return OK;
    }
    return PASS;
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
    await Auth.update({ password: data.new_password }, {
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
    let res = await Auth.findAll({
        raw: true,
        attributes: ["name", "surname"],
        where: {
            id: data.id
        }
    })
    return {
        name: res[res.length-1].name,
        surname: res[res.length-1].surname
    }
}

async function get_users_by_school(data) {
    if (!data_checker(data, ["school_id"]))
        return DATA
    let res = await Auth.findAll({
        raw: true,
        where: {
            school_id: data.school_id
        }
    })
    let ret = []
    for(let i = 0; i < res.length; i++){
        ret.push({
            'id': res[i].id,
            'name' : res[i].name,
            'surname': res[i].surname,
            'school_id': res[i].school_id,
            'class_id': res[i].class_id,
            'email': res[i].email,
            'phone': res[i].phone
        })
    }
    return ret
}

module.exports = {
    register, login, change_password, 
    get_name_surname, get_users_by_school
}