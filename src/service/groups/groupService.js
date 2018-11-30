import { Group, Quote } from '../../schemas'
import { sendMessage } from '../../bot/botOutput'
import config from '../../config'

function start(msg) {
  if (!msg) {
    return
  }
  var chatId = msg.chat.id

  Group.findOne({ chatId: chatId }, function(err, group) {
    if (!group) {
      addGroup(msg)
      return
    }

    sendMessage(msg, 'Group already exists! :)')
  })
}

function addGroup(msg) {
  var chatId = msg.chat.id

  var newGroup = Group({
    chatId: chatId,
    lastQuote: 0
  })
  newGroup.save(function(err) {
    if (err) throw err
    sendMessage(msg, 'Group successfully added! :)')
  })
}

function stats(msg) {
  var chatId = msg.chat.id
  Group.findOne({ chatId: chatId }, function(err, arr) {
    var d = new Date()
    if (d.getTime() - arr.lastQuote < config.spamSec * 1000) {
      console.log(
        'Spam block! Time left: ' + -(d.getTime() - arr.lastQuote) / 1000
      )
      return
    }
    Quote.count({ group: arr._id }, function(err, count) {
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
