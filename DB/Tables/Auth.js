import { Auth, sequelize, ERR, OK, PH, EM, initialize } from '../DB_init.js'


async function register(data, school, cls){ 
    let isp = (await Auth.findall({where:{
        phone:data.phone
    }})).length
    if (isp != 0)
        return PH
    let ise = (await Auth.findall({where:{
        email:data.email
    }})).length
    if (ise != 0)
        return EM
    try{
        const new_user = await Auth.create({
                name: data.name,
                surname: data.surname,
                school_id: school,
                class_id: cls,
                email: data.email,
                phone: data.phone,
                password: data.password
            })
        await new_user.save()
        return OK
    } catch {
        return ERR
    }
}

async function login(data){
    try{
        let logins = await Auth.findall({where:{
            $or:[
                { email: data.email },
                { phone: data.phone }
            ]
        }})
        for(let i = 0; i<logins.length; i++)
            if (logins.password == data.password)
                return true
        return false
    } catch {
        return false
    }
}

async function change_password(data){
    try{
        await Auth.update({password: data.password}, {where:{
            [sequelize.or]: [
                { email: data.email },
                { phone: data.phone }
            ]
        }})
        return OK
    } catch {
        return ERR
    }
}