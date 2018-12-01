import db from '../../schemas'
import { sendMessage } from '../../bot/botOutput'
import config from '../../config'

const start = msg => {
  if (!msg) {
    return
  }
  const chatId = msg.chat.id

  db.Group.findOne({ chatId: chatId }, (err, group) => {
    if (!group) {
      addGroup(msg)
      return
    }

    sendMessage(msg, 'Group already exists! :)')
  })
}

const addGroup = msg => {
  const chatId = msg.chat.id

  const newGroup = db.Group({
    chatId: chatId,
    lastQuote: 0
  })
  newGroup.save(err => {
    if (err) throw err
    sendMessage(msg, 'Group successfully added! :)')
  })
}

const stats = msg => {
  const chatId = msg.chat.id
  db.Group.findOne({ chatId: chatId }, (err, arr) => {
    const d = new Date()
    if (d.getTime() - arr.lastQuote < config.spamSec * 1000) {
      console.log(
        'Spam block! Time left: ' + -(d.getTime() - arr.lastQuote) / 1000
      )
      return
    }
    db.Quote.count({ group: arr._id }, (err, count) => {
      sendMessage(
        msg,
        'Quotes requested: ' +
          arr.counts.requests +
          '. Quotes returned: ' +
          arr.counts.returned +
          '. Quotes saved: ' +
          count
      )
    })
  })
}

export default {
  start: start,
  stats: stats
}
