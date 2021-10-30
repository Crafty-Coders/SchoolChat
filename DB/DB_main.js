const DB_init = require('./DB_init.js')

function synchronize(){
    sequelize.sync({force: true}).then(result=>{
        console.log(result);
      })
      .catch(err=> console.log(err));
}

function register(data){ 
    synchronize()
    let isp = DB_init.Auth.findall({where:{
        phone:data.phone
    }}).length
    if (isp != 0)
        return "Phone"
    let ise = DB_init.Auth.findall({where:{
        email:data.email
    }}).length
    if (ise != 0)
        return "Email"
    let stat
    DB_init.Auth.create({
        name: data.name,
        surname: data.surname,
        email: data.email,
        phone: data.phone,
        password: data.password
    }).then(res=>{
        stat = "ok"
    }).catch(err=>{
        stat = "error"
    })
    return stat
}

function login(data){
    let logins = DB_init.Auth.findall({where:{
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