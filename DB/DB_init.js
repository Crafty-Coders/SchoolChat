const { result } = require('lodash');
const Sequelize = require('sequelize');
const { PassThrough } = require('stream');

const sequelize = new Sequelize();
const ERR = "ERR";
const OK = "OK";
const PH = "PHONE";
const EM = "EMAIL";
const PASS = "PASSWORD"
const PR = "PREMISSION"

function initialize(){
  sequelize.sync().then(result=>{
      console.log(result);
    })
    .catch(err=> console.log(err));
}

const Auth = sequelize.define("auth", {
  id: {
    type: Sequelize.BIGINT,
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
  },
  picture_url: {
    type: Sequelize.STRING(1234),
    allowNull: true
  }
});

const Message = sequelize.define("message", {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  }, 
  chat_id: {
    type: Sequelize.INTEGER
  },
  user_id: {
    type: Sequelize.INTEGER
  },
  text: {
    type: Sequelize.STRING(1234)
  },
  attachments: {
    type: Sequelize.JSON
  },
  deleted_all: {
    type: Sequelize.BOOLEAN
  },
  deleted_user: {
    type: Sequelize.BOOLEAN
  },
  edited: {
    type: Sequelize.BOOLEAN
  }
});

const Class = sequelize.define("class", {
  id: {
    type: Sequelize.BIGINT,
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
});

const School = sequelize.define("school", {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  }, 
  name: {
    type: Sequelize.STRING
  }
});

const ChatUser = sequelize.define("chatuser", {
  row_id: {
    type: Sequelize.BIGINT,
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
});

const Chat = sequelize.define("chat", {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  }, 
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  creator: {
    type: Sequelize.STRING,
    allowNull: false
  },
  picture_url: {
    type: Sequelize.STRING,
    allowNull: true
  }
});

const ChatAdmin = sequelize.define("chatadmin", {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  }, 
  user_id: {
    type: Sequelize.STRING,
    allowNull: false
  }, 
  chat_id: {
    type: Sequelize.INTEGER
  }
});

module.exports = {
  Auth, Message, Class, School, ChatUser, Chat, ChatAdmin, sequelize
}