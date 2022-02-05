const { result } = require('lodash');
const Sequelize = require('sequelize');
const { PassThrough } = require('stream');

/*const sequelize = new Sequelize(config.DB, config.user, config.password, {
  dialect: "postgres",
  host: config.host
});*/
const DBURI = process.env.DATABASE_URL || require('../config.js').DBURI
const sequelize = new Sequelize(DBURI, {
  define: {
    charset: 'utf8',
    collate: 'utf8_general_ci'
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
})
const ERR = "ERR";
const OK = "OK";
const PH = "PHONE";
const EM = "EMAIL";
const PASS = "PASSWORD"
const PR = "PREMISSION"
const DATA = "DATA"
const NAME = "NAME"

function initialize() {
  sequelize.sync({ force: true }).then(result => {
    console.log(result);
  })
    .catch(err => console.log(err));
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
    type: Sequelize.BIGINT
  },
  class_id: {
    type: Sequelize.BIGINT
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
  },
  token: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, {
  charset: 'utf8',
  collate: 'utf8_general_ci'
});

const Message = sequelize.define("message", {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  chat_id: {
    type: Sequelize.BIGINT
  },
  user_id: {
    type: Sequelize.BIGINT
  },
  text: {
    type: Sequelize.STRING(1234)
  },
  attachments: {
    type: Sequelize.JSON
  },
  deleted_all: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  deleted_user: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  edited: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  service: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  user_name: {
    type: Sequelize.STRING,
    defaultValue: ""
  },
  user_pic_url: {
    type: Sequelize.STRING,
    defaultValue: ""
  }
}, {
  charset: 'utf8',
  collate: 'utf8_general_ci'
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
  },
  description: {
    type: Sequelize.STRING,
    defaultValue: ""
  },
  deleted: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  invite_code: {
    type: Sequelize.STRING
  }
}, {
  charset: 'utf8',
  collate: 'utf8_general_ci'
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
  },
  location: {
    type: Sequelize.STRING
  },
  deleted: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
}, {
  charset: 'utf8',
  collate: 'utf8_general_ci'
});

const ChatUser = sequelize.define("chatuser", {
  row_id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  user_id: {
    type: Sequelize.BIGINT
  },
  chat_id: {
    type: Sequelize.BIGINT
  },
  left: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  showBefore: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
}, {
  charset: 'utf8',
  collate: 'utf8_general_ci'
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
    type: Sequelize.BIGINT,
    allowNull: false
  },
  picture_url: {
    type: Sequelize.STRING,
    allowNull: true
  },
  deleted: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  class_id: {
    type: Sequelize.BIGINT,
    defaultValue: 0
  }
}, {
  charset: 'utf8',
  collate: 'utf8_general_ci'
});

const ChatAdmin = sequelize.define("chatadmin", {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  user_id: {
    type: Sequelize.BIGINT,
    allowNull: false
  },
  chat_id: {
    type: Sequelize.BIGINT
  },
  creator_id: {
    type: Sequelize.BIGINT
  }
}, {
  charset: 'utf8',
  collate: 'utf8_general_ci'
});

module.exports = {
  Auth, Message, Class,
  School, ChatUser, Chat,
  ChatAdmin, sequelize, initialize,
  ERR, OK, PH,
  EM, PASS, PR,
  NAME, DATA, Sequelize
}