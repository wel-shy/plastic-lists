//
import * as dotenv from 'dotenv'
import * as http from 'http'
import * as ws from 'ws'
import * as express from 'express'
import * as cors from 'cors'
import * as cookieParser from 'cookie-parser'
import * as path from 'path'
import { addRoutes } from './routes'
dotenv.load()

let app = express()

app.use(express.static(path.join(__dirname, '../../public')))
app.use(cors({
  origin: '*'
}))
app.use(cookieParser())

const server = new http.Server(app)

const wss = new ws.Server({
  server: server,
  path: '/ws',
  clientTracking: true
})

wss.on('connection', (ws) => {
  console.log('got connection from', ws)
  ws.on('message', (message) => {
    console.log('Received: ', message)
    for (let client of wss.clients) {
      console.log(client)
      client.send(message)
    }
  })
})

wss.on('error', (e) => {
  console.log(e)
})

app = addRoutes(app, wss)

console.log('Starting');
server.listen(process.env.PORT, () => {
  console.log(`Listenting on ${process.env.PORT}`)
})
