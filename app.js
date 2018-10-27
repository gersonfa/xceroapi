const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const helmet = require('helmet')

const port = process.env.PORT || 3019

const passport = require('passport')
const chalk = require('chalk')
const http = require('http')
const cors = require('cors')

const server = http.createServer(app)
const io = require('socket.io')(server)
const redis = require('socket.io-redis')
io.adapter(redis({ host: 'localhost', port: 6379 }))

app.use(bodyParser.json({ limit: '4mb' }))
app.use(bodyParser.urlencoded({ extended: false, limit: '4mb' }))

app.use(cookieParser())
app.use(cors())
app.use(logger('dev'))
app.use(helmet())
app.enable('trust proxy')
app.use(passport.initialize())
app.use(express.static('public/dist'))

require('./startup/logging')()
require('./startup/routes')(app, io)
require('./startup/db')()

server.listen(port, () => {
  console.log(`${chalk.green('[xcero-api]')} server listening on port ${port}`)
})
