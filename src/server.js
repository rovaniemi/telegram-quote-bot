import dotenv from 'dotenv'
import { connectToDatabase } from './db/connection'
import { controlBotCommands } from './bot/commandController'
import { startApi } from './api/api'
dotenv.config()

connectToDatabase()
controlBotCommands()
startApi()
