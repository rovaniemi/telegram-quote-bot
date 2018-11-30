import { Quote, Group } from '../../schemas'
import TelegramBot from 'node-telegram-bot-api'
import config from '../../config'
import { sendQuote } from '../../bot/botOutput'
const bot = new TelegramBot(process.env.API_TOKEN)

function sleep(msg) {
  var chatId = msg.chat.id

  Group.findOne({ chatId: chatId }, function(err, arr) {
    if (err) {
      console.log(err.stack)
      return
    }
    var d = new Date()
    if (d.getTime() - arr.lastQuote < config.spamSec * 1000) {
      console.log(
        'Already asleep! Time left: ' + -(d.getTime() - arr.lastQuote) / 1000
      )
      return
    }

    arr.lastQuote = d.getTime() + config.sleepTime * 1000

    arr.save(function(err) {
      if (err) {
        console.log(err.stack)
        return
      }
      console.log('sleeping for 200 seconds')
      bot.sendMessage(msg.chat.id, 'ok, ,___, ')
    })
  })
}

function quote(msg, match) {
  var chatId = msg.chat.id
  Group.findOne({ chatId: chatId }, function(err, arr) {
    if (err) {
      console.log(err.stack)
      return
    }
    if (!arr) {
      console.log('quoteservice / quote(): no groups matched, terminating.')
      return
    }

    if (!arr.counts || !arr.counts.returned) {
      arr.counts.returned = 0
      arr.counts.requests = 0
    }

    var d = new Date()
    if (
      msg.from.id != process.env.JULIUS &&
      d.getTime() - arr.lastQuote < config.spamSec * 1000
    ) {
      console.log(
        'Blocked for spam! Time left: ' + -(d.getTime() - arr.lastQuote) / 1000
      )
    } else {
      if (match[4] === undefined) {
        getQuoteForGroup(msg, arr._id, '.')
      } else {
        console.log('searching for: ' + match[4])
        getQuoteForGroup(msg, arr._id, match[4])
      }

      // Sets time for previous quote and saves group.
      arr.lastQuote = d.getTime()
      arr.lastRequestBy = msg.from.id

      arr.counts.returned++
    }

    arr.counts.requests++
    arr.save(function(err) {
      if (err) {
        console.log(err.stack)
        return
      }
    })
  })
}

function imFeelingLucky(msg, match) {
  var chatId = msg.chat.id

  Group.findOne({ chatId: chatId }, function(err, arr) {
    if (err) {
      console.log(err.stack)
      return
    }

    var d = new Date()
    if (
      msg.from.id != process.env.JULIUS &&
      d.getTime() - arr.lastQuote < config.spamSec * 1000
    ) {
      console.log(
        'Blocked for spam! Time left: ' + -(d.getTime() - arr.lastQuote) / 1000
      )
    } else {
      // if (match[4] == undefined) {
      getQuoteForGroup(msg, false, '.')
      // } else {
      //     console.log("searching for: " + match[4]);
      //     getQuoteForGroup(msg, false, match[4]);
      // }
      arr.lastQuote = d.getTime()
      arr.lastRequestBy = msg.from.id
      // arr.counts.returned = 1;
    }
    // arr.counts.requests = 1;
    arr.save(function(err) {
      if (err) {
        console.log(err.stack)
        return
      }
    })
  })
}

function voteCallback(callbackQuery) {
  var parts = callbackQuery.data.split('|')
  if (parts[0] == '+' || parts[0] == '-') {
    Quote.findById(parts[1], function(err, quote) {
      if (err) {
        console.log(err.stack)
        return
      }
      if (quote.votes) {
        if (parts[0] == '+') quote.votes.upVotes++
        if (parts[0] == '-') quote.votes.downVotes++

        quote.save(function(err, quote) {
          if (err) {
            console.log(err.stack)
            return
          }
          console.log(quote.votes)
        })
        // bot.answerCallbackQuery(callbackQuery.id, ":D");
      }
    })
  }
  const options = {
    chat_id: callbackQuery.message.chat.id,
    message_id: callbackQuery.message.message_id
  }
  bot.editMessageReplyMarkup({ parse_mode: 'Markdown' }, options)
}

function escape(text) {
  return text.replace(/[-[\]{}()*+?,\\^$|#\s]/g, '\\$&')
}

function getQuoteForGroup(msg, group_id, search, fn) {
  if (!group_id) {
    console.log('no group id.')
    return
  }
  // search = search.replace(/\[a\]/g, "").trim();
  var re = new RegExp(escape(search.trim()), 'i')

  var filter = { group: group_id, quote: re }

  if (search == '.' || search.indexOf('?') != -1) {
    filter.quote = new RegExp('.', 'i')
    var terms = {
      up: 'obj.votes.upVotes > 3',
      downvotes: 'obj.votes.downVotes == 0',
      nothing: 'true',
      question: 'obj.quote.length<50'
    }

    var rand = Math.random()
    var quality = 0
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
      // fields.quote = new RegExp('.');
      filter.$where += ' && ' + terms.question
    }
  }
  console.log(filter)
  Quote.count(filter).exec(function(err, count) {
    var random = Math.floor(Math.random() * count)
    Quote.findOne(filter)
      .skip(random)
      .exec(function(err, result) {
        if (err) {
          console.log(err.stack)
          return
        }
        if (result) {
          sendQuote(msg, result)
        } else {
          getQuoteForGroup(msg, group_id, '.')
        }
        // result is random
      })
  })
}

export default {
  quote: quote,
  imFeelingLucky: imFeelingLucky,
  voteCallback: voteCallback
}
