const express = require('express')
const app = express()

app.set("view engine", "ejs")

app.use(express.static("public"))

app.get('/', (req, res) => {
    res.render("index")
})

mobile_server = app.listen(process.env.PORT || 3000, () => console.log(`Server is runnung ${process.env.PORT}`)) //! ТАК СДЕЛАТЬ МИШЕ
require('./WS/ws')