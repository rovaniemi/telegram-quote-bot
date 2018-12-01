import { Quote, Group } from '../../schemas'
import TelegramBot from 'node-telegram-bot-api'
import config from '../../config'
import { sendQuote, sendMessage } from '../../bot/botOutput'
const bot = new TelegramBot(process.env.API_TOKEN)

const quote = (msg, match) => {
  const chatId = msg.chat.id
  Group.findOne({ chatId: chatId }, (err, arr) => {
    if (err) {
      return
    }

    if (!arr) {
      sendMessage(msg, 'No groups matched, please start with command /start')
      return
    }

    if (!arr.counts || !arr.counts.returned) {
      arr.counts.returned = 0
      arr.counts.requests = 0
    }

    const d = new Date()
    if (!(d.getTime() - arr.lastQuote < config.spamSec * 1000)) {
      if (match[4] === undefined) {
        getQuoteForGroup(msg, arr._id, '.')
      } else {
        getQuoteForGroup(msg, arr._id, match[4])
      }

      arr.lastQuote = d.getTime()
      arr.lastRequestBy = msg.from.id
      arr.counts.returned++
    }

    arr.counts.requests++
    arr.save(err => {
      if (err) {
        return
      }
    })
  })
}

const voteCallback = callbackQuery => {
  const parts = callbackQuery.data.split('|')
  if (parts[0] == '+' || parts[0] == '-') {
    Quote.findById(parts[1], (err, quote) => {
      if (err) {
        console.log(err.stack)
        return
      }
      if (quote.votes) {
        if (parts[0] == '+') quote.votes.upVotes++
        if (parts[0] == '-') quote.votes.downVotes++

        quote.save((err, quote) => {
          if (err) {
            console.log(err.stack)
            return
          }
          console.log(quote)
        })
      }
    })
  }
  const options = {
    chat_id: callbackQuery.message.chat.id,
    message_id: callbackQuery.message.message_id
  }
  bot.editMessageReplyMarkup({ parse_mode: 'Markdown' }, options)
}

const getQuoteForGroup = (msg, group_id, search) => {
  if (!group_id) {
    return
  }

  const re = new RegExp(
    search.trim().replace(/[-[\]{}()*+?,\\^$|#\s]/g, '\\$&'),
    'i'
  )

  const filter = { group: group_id, quote: re }

  if (search == '.' || search.indexOf('?') != -1) {
    filter.quote = new RegExp('.', 'i')
    const terms = {
      up: 'obj.votes.upVotes > 3',
      downvotes: 'obj.votes.downVotes == 0',
      nothing: 'true',
      question: 'obj.quote.length<50'
    }

    const rand = Math.random()
    let quality = 0
    if (rand < 0.2) {
      quality = -3
    } else if (rand < 0.6) {
      quality = 0
    } else if (rand < 0.8) {
      quality = 1
    } else if (rand < 0.9) {
      quality = 3
    } else if (rand < 1) {
      quality = 4
    }
    filter.$where = 'obj.votes.downVotes + obj.votes.upVotes >= ' + quality

    if (search.indexOf('?') != -1) {
      filter.$where += ' && ' + terms.question
    }
  }

  Quote.count(filter).exec(function(err, count) {
    const random = Math.floor(Math.random() * count)
    Quote.findOne(filter)
      .skip(random)
      .exec(function(err, result) {
        if (err) {
          return
        }
        if (result) {
          sendQuote(msg, result)
        } else {
          getQuoteForGroup(msg, group_id, '.')
        }
      })
  })
}

export default {
  quote: quote,
  voteCallback: voteCallback
}
