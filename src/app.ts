//
import * as dotenv from 'dotenv'
dotenv.load()

import app from './config'

console.log('Starting');
app.listen(process.env.PORT, () => {
  console.log(`Listenting on ${process.env.PORT}`)
})
