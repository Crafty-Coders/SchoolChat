const { result } = require('lodash');
const Sequelize = require('sequelize');
const { PassThrough } = require('stream');
const sequelize = new Sequelize();


class Auth extends Model {}
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
})

class Message extends Model {}
Message.init({

})

class Class extends Model {}
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
})

class School extends Model {}
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
})

class User extends Model {}
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
})

class Chat extends Model {}
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
})

class Admin extends Model {}
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
})

 