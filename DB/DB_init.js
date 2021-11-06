const { result } = require('lodash');
const Sequelize = require('sequelize');
const { PassThrough } = require('stream');

const sequelize = new Sequelize();;
const ERR = "ERR";
const OK = "OK";
const PH = "PHONE";
const EM = "EMAIL";
const PASS = "PASSWORD"

function initialize(){
  sequelize.sync().then(result=>{
      console.log(result);
    })
    .catch(err=> console.log(err));
}

class Auth extends Sequelize.Model {}
Auth.init({
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  }, 
  name: {
    type: Sequelize.STRING
  },
  surname: {
    type: Sequelize.STRING
  },
  school_id: {
    type: Sequelize.INTEGER
  },
  class_id: {
    type: Sequelize.INTEGER
  },
  email: {
    type: Sequelize.STRING
  }, 
  phone: {
    type: Sequelize.STRING
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, {
  sequelize, 
  modelname: "auth"
});

class Message extends Sequelize.Model {}
Message.init({

});

class Class extends Sequelize.Model {}
Class.init({
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  }, 
  name: { 
    type: Sequelize.STRING
  },
  school_id: {
    type: Sequelize.INTEGER
  }
}, {
  sequelize, 
  modelname: "classes"
});

class School extends Sequelize.Model {}
School.init({
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  }, 
  name: {
    type: Sequelize.STRING
  }
}, {
  sequelize, 
  modelname: "schools"
});

class ChatUser extends Sequelize.Model {}
User.init({
  row_id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  }, 
  user_id: {
    type: Sequelize.INTEGER
  },
  chat_id: {
    type: Sequelize.INTEGER
  }
}, {
  sequelize, 
  modelname: "chatusers"
});

class Chat extends Sequelize.Model {}
Chat.init({
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  }, 
  creator: {
    type: Sequelize.STRING,
    allowNull: false
  },
  admins: {
    type: Sequelize.STRING //user id_s
  },
  creation_time: {
    type: Sequelize.DATE
  }
}, {
  sequelize, 
  modelname: "chats"
});

class Admin extends Sequelize.Model {} // админы всего сайта, а не чатов
Admin.init({
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  }, 
  user_id: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, {
  sequelize, 
  modelname: "admins"
});

module.exports = {
  Auth, Message, Class, School, ChatUser, Chat, Admin, sequelize
}