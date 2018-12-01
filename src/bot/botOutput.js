import TelegramBot from 'node-telegram-bot-api'
const bot = new TelegramBot(process.env.API_TOKEN)

export const sendMessage = (msg, message) => {
  const options = {
    parse_mode: 'Markdown'
  }

  bot.sendMessage(msg.chat.id, parseMessage(msg, message), options)
}

export const sendQuote = (msg, quote, message) => {
  if (message) {
    quoteSender(msg, message + quote.quote)
    return
  }

  if (
    (quote.quote.length > 7 && quote.quote.substr(0, 5) == 'sti!:') ||
    (quote.type && quote.type == 'sticker')
  ) {
    sendSticker(msg, quote)
    return
  }

  if (quote.type && quote.type != 'text') {
    sendFileType(msg, quote)
    return
  }

  quoteSender(msg, quote.quote, quote._id)
}

const quoteSender = (msg, message, quoteId) => {
  const chatId = msg.chat.id

  message = parseMessage(msg, message)

  const options = getOptions(quoteId)

  bot.sendMessage(chatId, message, options)
}

const sendFileType = (msg, quote) => {
  const chatId = msg.chat.id
  const options = getOptions(quote._id)

  if (quote.type == 'voice') {
    bot.sendVoice(chatId, quote.resourceId, options)
    return
  }

  if (quote.type == 'audio') {
    bot.sendAudio(chatId, quote.resourceId, options)
    return
  }

  if (quote.type == 'photo') {
    bot.sendPhoto(chatId, quote.resourceId, options)
    return
  }
}

const sendSticker = (msg, quote) => {
  const chatId = msg.chat.id
  const options = getOptions(quote._id)

  // FOR DEPRECATED STICKER SYNTAX, YEAH ILL DEAL WITH IT LATER
  if (quote.quote.substr(0, 5) == 'sti!:') {
    const stickerId = quote.quote.split(':')[1].split('(')[0]
    try {
      console.log(stickerId)
      bot.sendSticker(chatId, stickerId, options)
    } catch (err) {
      console.log('invalid sticker syntax ' + err)
    }
    return
  }
  if (quote.type == 'sticker') {
    bot.sendSticker(chatId, quote.resourceId, options)
  }
}

const getOptions = quoteId => {
  if (!quoteId) {
    const options = {
      parse_mode: 'Markdown'
    }
  } else {
    const options = {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [
            { text: '😀', callback_data: '+|' + quoteId },
            { text: '😑', callback_data: '-|' + quoteId },
            { text: '❌', callback_data: '0' }
          ]
        ]
      }),
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    }
  }
  return options
}

const parseMessage = (msg, message) => {
  message = message.replaceAll(':user:', msg.from.first_name)
  if (msg.text && msg.text.indexOf('[a]') != -1) {
    message = message.split('')
    message = message.join(' ')
  }
  return message
}

String.prototype.replaceAll = (search, replacement) => {
  const target = this
  return target.split(search).join(replacement)
}
