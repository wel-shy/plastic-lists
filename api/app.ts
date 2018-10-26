//
import * as dotenv from 'dotenv'
import * as http from 'http'
import * as ws from 'ws'
import * as express from 'express'
import * as cors from 'cors'
import * as cookieParser from 'cookie-parser'
import { addRoutes } from './routes'
import * as bodyParser from 'body-parser'
import * as path from 'path'
dotenv.config({path: path.join(__dirname, '../../.env')})

let app = express()

// Add cors
app.use(cors({
  origin: '*'
}))

// Add cookie parser
app.use(cookieParser())

// Body parser for post and put routes
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// Create new server
const server = new http.Server(app)

// Create new websocket server
const wss = new ws.Server({
  server: server,
  path: '/ws',
  clientTracking: true
})

// On connection
wss.on('connection', (ws) => {
// On a new message
  ws.on('message', (message) => {
  // Broadcast new message to all connected clients
    for (let client of wss.clients) {
      client.send(message)
    }
  })
})

wss.on('error', (e) => {
  console.log(e)
})

// Add routes, pass websocket server to api router
app = addRoutes(app, wss)

server.listen(process.env.PORT, () => {
  console.log(`Listenting on ${process.env.PORT}`)
})
