import dotenv from 'dotenv'
import mongoose from 'mongoose'
dotenv.config()

const url = process.env.MONGOLAB_URL || 'mongodb://localhost/quotes'
mongoose.Promise = global.Promise
mongoose.set('useFindAndModify', false)
mongoose.connect(
  url,
  { useNewUrlParser: true }
)

mongoose.connection.on('error', function(err) {
  console.error('MongoDB error: %s', err)
})

process.on('uncaughtException', function(err) {
  console.error(new Date().toUTCString() + ' uncaughtException:', err.message)
  console.error(err.stack)
  process.exit(1)
})

require('./bot/commandController')
require('./api/api')

process.on('SIGINT', function() {
  db.stop(function(err) {
    process.exit(err ? 1 : 0)
  })
})
