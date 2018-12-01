import TelegramBot from 'node-telegram-bot-api'
import groupService from './../service/groups/groupService'
import quoteFinder from './../service/quotes/quoteFinder'
import rollService from './../service/rollService'
import manageQuotes from './../service/quotes/manageQuotes'

export const controlBotCommands = () => {
  const token = process.env.API_TOKEN
  const bot = new TelegramBot(token, { polling: true })
  bot.onText(/\/start/, (msg, match) => {
    groupService.start(msg)
  })

  bot.onText(/\/(stats(\@puppy2_bot)?)/, (msg, match) => {
    groupService.stats(msg)
  })

  // QUOTEFINDER

  bot.onText(/\/(sleep(\@puppy2_bot)?)/, (msg, match) => {
    quoteFinder.sleep(msg)
  })

  bot.onText(/\/(quote(\@puppy2_bot)?)( (.+)|\0{0})/, (msg, match) => {
    quoteFinder.quote(msg, match)
  })

  bot.onText(/((?!)|(^@puppy2_bot?( (.+)|\0{0})))/, (msg, match) => {
    quoteFinder.quote(msg, match)
  })

  // QUOTEMANAGER

  bot.onText(/^\/(add(\@puppy2_bot)?)( (.+)|\0{0})/, (msg, match) => {
    manageQuotes.add(msg, match)
  })

  bot.onText(/\/(findquotes(\@puppy2_bot)?) (.+)/, (msg, match) => {
    manageQuotes.findQuote(msg, match)
  })

  bot.onText(/\/(delid(\@puppy2_bot)?) (.+)/, (msg, match) => {
    manageQuotes.delQuote(msg, match, true)
  })

  bot.onText(/\/(delquote(\@puppy2_bot)?) (.+)/, (msg, match) => {
    manageQuotes.delQuote(msg, match)
  })

  // ROLLSERVICE

  bot.onText(/\/(roll(\@puppy2_bot)?)( (.+)|\0{0})/, (msg, match) => {
    rollService.roll(msg, match)
  })

  // CALLBACK

  bot.on('callback_query', callbackQuery => {
    quoteFinder.voteCallback(callbackQuery)
  })
}
