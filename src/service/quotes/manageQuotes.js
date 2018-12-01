import { Quote, Group } from '../../schemas'
import TelegramBot from 'node-telegram-bot-api'
import { sendMessage, sendQuote } from '../../bot/botOutput'

function add(msg, match) {
  const chatId = msg.chat.id

  if (msg.reply_to_message) {
    if (msg.reply_to_message.text) {
      addQuote(msg.from.id, msg, msg.reply_to_message.text)
      return
    }

    if (msg.reply_to_message.sticker) {
      addByType(msg, match, 'sticker')
      return
    }

    if (msg.reply_to_message.voice) {
      addByType(msg, match, 'voice')
      return
    }

    if (msg.reply_to_message.audio) {
      addByType(msg, match, 'audio')
      return
    }
  }

  if (match[4] == undefined) {
    return
  }

  addQuote(msg.from.id, msg, match[4])
}

function addByType(msg, match, type) {
  if (msg.reply_to_message[type]) {
    var quote = match[4]
    if (!match[4]) {
      quote = type
    }
    if (msg.reply_to_message.sticker) {
      quote += ' ' + msg.reply_to_message.sticker.emoji
    }
    addQuote(msg.from.id, msg, quote, type, msg.reply_to_message[type].file_id)
    return
  }
}

function addQuote(addedBy, msg, toAdd, type, resourceId) {
  var chatId = msg.chat.id

  var groupId = 0
  var quoteId = 0

  Group.findOne({ chatId: chatId }, function(err, group) {
    if (!group) {
      return
    }
    groupId = group._id

    if (!type) {
      type = 'text'
    }

    var newQuote = Quote({
      quote: toAdd,
      addedBy: addedBy,
      group: groupId,
      type: type,
      resourceId: resourceId,
      votes: {
        upVotes: 0,
        downVotes: 0
      }
    })

    newQuote.save(function(err, quote) {
      function loadData(err, data) {
        if (err) {
          console.log(err.stack)
          return
        }
      }

      if (quote) {
        sendQuote(msg, quote, ':user: added quote: ')
      } else {
        sendMessage(chatId, 'lol no')
      }
    })
  })
}

function delQuote(msg, match, idBool) {
  var chatId = msg.chat.id
  if (msg.from.id !== process.env.JULIUS) {
    return
  }
  if (idBool) {
    Quote.find({ _id: match[3] })
      .remove()
      .exec(function(err) {
        if (err) {
          sendMessage(msg, "couldn't find it")
          return
        }
        sendMessage(msg, 'deleted it :P')
      })
  } else {
    var re = new RegExp(match[3], 'i')

    Quote.find({ quote: re }, function(err, quote) {
      if (err) {
        console.log(err.stack)
        return
      }
      if (quote.length > 1) {
        sendMessage(msg, 'found ' + quote.length + ' quotes, did nothing.')
        findQuote(msg, match)
      }
      if (quote.length === 1) {
        var text = '*deleted quote*: ' + quote[0].quote
        Quote.findByIdAndRemove(quote[0]._id, function(err) {
          sendMessage(msg, text)
        })
      } else {
        sendMessage(msg, 'found nothing...')
      }
    })
  }
}

function findQuote(msg, match) {
  var chatId = msg.chat.id
  var re = new RegExp(escape(match[3].trim()), 'i')

  Quote.find({ quote: re }, function(err, quote) {
    if (msg.from.id != process.env.JULIUS) {
      return
    }
    if (quote) {
      for (var i in quote) {
        sendMessage(chatId, quote[i].quote + ' ' + quote[i]._id)
      }
    }
  })
}

export default {
  add: add,
  findQuote: findQuote,
  delQuote: delQuote
}
