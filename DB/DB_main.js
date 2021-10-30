const DB_init = require('./DB_init.js')

function synchronize(){
    sequelize.sync().then(result=>{
        console.log(result);
      })
      .catch(err=> console.log(err));
}

async function register(data){ 
    synchronize()
    let isp = (await DB_init.Auth.findall({where:{
        phone:data.phone
    }})).length
    if (isp != 0)
        return "Phone"
    let ise = (await DB_init.Auth.findall({where:{
        email:data.email
    }})).length
    if (ise != 0)
        return "Email"
    try{
        const new_user = await DB_init.Auth.create({
                name: data.name,
                surname: data.surname,
                email: data.email,
                phone: data.phone,
                password: data.password
            })
        await new_user.save()
        return "OK"
    } catch {
        return "ERR"
    }
}

async function login(data){
    let logins = await DB_init.Auth.findall({where:{
        $or:[
            {
                email: data.email
            },
            {
                phone: data.phone
            }
        ]
    }})
    for(let i = 0; i<logins.length; i++)
        if (logins.password == data.password)
            return true
    return false
}

async function change_password(data){
    try{
        await DB_init.Auth.update({password: data.password}, {where:{
            $or: [
                {
                    email: data.email
                },
                {
                    phone: data.phone
                }
            ]
        }})
        return "OK"
    } catch {
        return "ERR"
    }
}