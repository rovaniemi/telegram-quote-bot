import mongoose from 'mongoose'
import random from 'mongoose-simple-random'

let Schema = mongoose.Schema

var quotesSchema = new Schema({
  quote: String,
  type: String,
  resourceId: String,
  index: Number,
  group: {
    type: Schema.ObjectId,
    ref: 'Group'
  },
  rating: { type: Number, default: 1 },
  votes: {
    upVotes: { type: Number, default: 0 },
    downVotes: { type: Number, default: 0 }
  }
})

var groupsSchema = new Schema({
  chatId: { type: Number, unique: true },
  users: [{ userId: String, lastQuote: Number }],
  lastQuote: { type: Number, default: 0 },
  lastRequestBy: { type: Number, default: 0 },
  config: {
    sleepLength: Number,
    quoteBuffer: Number
  },
  counts: {
    requests: { type: Number, default: 0 },
    returned: { type: Number, default: 0 }
  }
})

quotesSchema.plugin(random)

export const Quote = mongoose.model('Quote', quotesSchema)
export const Group = mongoose.model('Group', groupsSchema)
