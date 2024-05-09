const mongoose = require('mongoose')
require('dotenv').config({ path: './config/.env' });
const dbUri = process.env.MONGO_URI


const connectDb = async () => {
  await mongoose.connect(dbUri).then(
    () => {
      console.info(`Connected to database`)
    },
    error => {
      console.error(`Connection error: ${error.stack}`)
      process.exit(1)
    }
  )
}

// connectDb().catch(error => console.error(error))

module.exports = connectDb