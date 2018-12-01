import mongoose from 'mongoose'

export const connectToDatabase = () => {
  mongoose
    .connect(
      process.env.MONGOLAB_URL,
      { useNewUrlParser: true }
    )
    .then(() => {
      console.log('connected to database')
    })
    .catch(err => {
      console.log(err)
    })
}
