const express = require('express')
const app = express()

app.set("view engine", "ejs")

mobile_server = app.listen(process.env.PORT || 3000, () => console.log(`Server is running ${process.env.PORT}`)) //! ТАК СДЕЛАТЬ МИШЕ
require('./WS/ws')