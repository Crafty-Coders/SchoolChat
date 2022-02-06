const AuthDB = require('./Tables/Auth.js')
// const ChatUserDB = require('./Tables/Chat-User.js')
const MessageDB = require('./Tables/Message.js')
const SchoolClassDB = require('./Tables/School-Class.js')
const initialize = require('./DB_init').initialize
module.exports = {
    AuthDB, MessageDB, SchoolClassDB, initialize
}