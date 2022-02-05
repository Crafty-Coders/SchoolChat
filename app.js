const express = require('express')
const app = express()
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const ChatUserDB = require('./DB/Tables/Chat-User')
const { AuthDB } = require('./DB/DB_main')
const chalk = require('chalk')


const initializePassport = require('./passport-config');
const { count } = require('console');
const { resolveObjectURL } = require('buffer');
const { Auth } = require('./DB/DB_init');
initializePassport(
    passport,
    FindUserEmail,
    AuthDB.getAuthDataId
)

const users = []


app.set("view engine", "ejs")

app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(express.static(__dirname));
app.use(session({
    secret: "aaaaaaa",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'));


const clients = [];
let array = [{
    text: "test message",
    date: Date.now()
}];

/* /////////////////// Router ///////////////////// */
app.get('/', checkAuthenticated, async (req, res) => {
    let user = await req.user
    console.log(chalk.red(user.name))
    // функция, которая будет добывать массив чатов
    let chatsArr =  await GetChats(user.id)
    res.render('index.ejs', {
        name: user.name,
        title: "registration",
        greeting: "Добро пожаловать, " + user.name,
        chats: chatsArr,
        id: user.id,
        //messages: messages
    })
});

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs', {
        test: "test message",
        greeting: "Здравствуйте"
    })
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs', {
        test: "register",
        greeting: "Регистрация"
    })
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        let newUser = {
            name: req.body.name,
            surname: req.body.surname,
            email: req.body.email,
            phone: req.body.phone_number,
            password: hashedPassword,
            invite_code: req.body.code,
        };
        await AuthDB.register(newUser)
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
})

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

async function FindUserEmail(data) {
    let res = await AuthDB.getAuthData({"data": data})
    if (res["stat"] == 'ERR') {
        return null
    }
    console.log(res)
    return res["data"]
}

async function GetChats(user_id) {
    console.log(user_id)
    let chats = []
    let userchats = await ChatUserDB.get_user_chats({"user_id" : user_id})
    for (let i = 0; i < userchats.length; i++) {
        chats.push((await ChatUserDB.get_chat_info({"chat_id": userchats[i], "user_id": user_id})))
    }
    return chats
}

mobile_server = app.listen(process.env.PORT || 3000, () => console.log(`Server is running ${process.env.PORT}`)) //! ТАК СДЕЛАТЬ МИШЕ
require('./WS/ws')