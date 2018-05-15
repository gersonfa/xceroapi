const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const helmet = require('helmet')
const port = process.env.PORT || 3000
const mongoose = require('mongoose')
const config = require('./config/db')
const options = require('./config/config')
const passport = require('passport')
const router = require('./app/router/index')
const chalk = require('chalk')
const http = require('http')
const cors = require('cors')

const server = http.createServer(app)
const io = require('socket.io')(server)

io.on('connection', (socket) => {
  console.log(`Nueva conexión, id: ${socket.id}`)
})

mongoose.Promise = require('bluebird')
mongoose.connect(config.database, {
  useMongoClient: true
})

app.use(bodyParser.json({
  limit: '4mb'
}))

app.use(bodyParser.urlencoded({
  extended: false,
  limit: '4mb'
}))

app.use(cookieParser())
app.use(cors())
app.use(logger('dev'))
app.use(helmet())

app.use(passport.initialize())

function handleFatalError(err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

app.use(express.static(path.join(__dirname, 'dist')))
app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'))
});

if (!module.parent) {
  process.on('unhandledRejection', handleFatalError)

  server.listen(port, () => {
    console.log(`${chalk.green('[berel-api]')} server listening on port ${port}`)
  })

  router(app, io)

  app.use((err, req, res, next) => {
    if (err.message.match(/not found/)) {
      return res.status(404).send({
        error: err.message
      })
    }
    res.status(500).send({
      error: err.message
    })
  })
}