import db from '../../schemas'
import { sendMessage, sendQuote } from '../../bot/botOutput'

const add = (msg, match) => {
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

const addByType = (msg, match, type) => {
  if (msg.reply_to_message[type]) {
    let quote = match[4]
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

const addQuote = (addedBy, msg, toAdd, type, resourceId) => {
  const chatId = msg.chat.id

  const groupId = 0

  db.Group.findOne({ chatId: chatId }, (err, group) => {
    if (!group) {
      return
    }
    groupId = group._id

    if (!type) {
      type = 'text'
    }

    const newQuote = db.Quote({
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

    newQuote.save((err, quote) => {
      if (quote) {
        sendQuote(msg, quote, ':user: added quote: ')
      } else {
        sendMessage(chatId, 'lol no')
      }
    })
  })
}

const delQuote = (msg, match, idBool) => {
  if (msg.from.id !== process.env.JULIUS) {
    return
  }
  if (idBool) {
    db.Quote.find({ _id: match[3] })
      .remove()
      .exec(err => {
        if (err) {
          sendMessage(msg, "couldn't find it")
          return
        }
        sendMessage(msg, 'deleted it :P')
      })
  } else {
    const re = new RegExp(match[3], 'i')

    db.Quote.find({ quote: re }, (err, quote) => {
      if (err) {
        console.log(err.stack)
        return
      }
      if (quote.length > 1) {
        sendMessage(msg, 'found ' + quote.length + ' quotes, did nothing.')
        findQuote(msg, match)
      }
      if (quote.length === 1) {
        const text = '*deleted quote*: ' + quote[0].quote
        db.Quote.findByIdAndRemove(quote[0]._id, err => {
          sendMessage(msg, text)
        })
      } else {
        sendMessage(msg, 'found nothing...')
      }
    })
  }
}

const findQuote = (msg, match) => {
  const chatId = msg.chat.id
  const re = new RegExp(escape(match[3].trim()), 'i')

  db.Quote.find({ quote: re }, (err, quote) => {
    if (quote) {
      for (let i in quote) {
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
