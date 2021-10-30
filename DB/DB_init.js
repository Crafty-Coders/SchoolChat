const { result } = require('lodash');
const Sequelize = require('sequelize');
const { PassThrough } = require('stream');
const sequelize = new Sequelize();


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
})

class Message extends Sequelize.Model {}
Message.init({

})

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
})

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
})

class User extends Sequelize.Model {}
User.init({
  user_id: {
    type: Sequelize.INTEGER
  },
  class_id: {
    type: Sequelize.INTEGER
  },
  chat_id: {
    type: Sequelize.INTEGER
  }
}, {
  sequelize, 
  modelname: "users"
})

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
    type: Sequelize.STRING
  },
  creation_time: {
    type: Sequelize.DATE
  }
}, {
  sequelize, 
  modelname: "chats"
})

class Admin extends Sequelize.Model {}
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
})

 