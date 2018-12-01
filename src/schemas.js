import mongoose from 'mongoose'
import random from 'mongoose-simple-random'
const Schema = mongoose.Schema

const quotesSchema = new Schema({
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

const groupsSchema = new Schema({
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

export default {
  Quote: mongoose.model('Quote', quotesSchema),
  Group: mongoose.model('Group', groupsSchema)
}
