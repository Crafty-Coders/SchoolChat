import { Auth, sequelize, ERR, OK, PH, EM, PASS, initialize } from '../DB_init.js';


async function register(name, surname, school_id, class_id, email, phone, password) {
    let isp = (await Auth.findall({
        where: {
            phone: phone
        }
    })).length;
    if (isp != 0)
        return PH;
    let ise = (await Auth.findall({
        where: {
            email: email
        }
    })).length;
    if (ise != 0)
        return EM;
    try {
        const new_user = await Auth.create({
            name: name,
            surname: surname,
            school_id: school_id,
            class_id: class_id,
            email: email,
            phone: phone,
            password: password
        });
        await new_user.save();
        return OK;
    } catch {
        return ERR;
    }
}

async function login(email = "#empty_email#", phone = "#empty_phone#", password) { // Default values are highlighted with #__#
    try {
        let logins = await Auth.findall({
            where: {
                [sequelize.or]: [
                    { email: email },
                    { phone: phone }
                ]
            }
        });
        for (let i = 0; i < logins.length; i++)
            if (logins[i].password == data.password)
                return OK;
        return PASS;
    } catch {
        return ERR;
    }
}

async function change_password(email = "#empty_email#", phone = "#empty_phone#", password) {
    try {
        await Auth.update({ password: password }, {
            where: {
                [sequelize.or]: [
                    { email: email },
                    { phone: phone }
                ]
            }
        });
        return OK;
    } catch {
        return ERR;
    }
}