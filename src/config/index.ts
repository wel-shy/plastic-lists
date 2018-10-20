import * as express from 'express'
import * as cors from 'cors'
import * as cookieParser from 'cookie-parser'
import * as path from 'path'

const app = express()

app.use(express.static(path.join(__dirname, '../../public')))
app.use(cors())
app.use(cookieParser())

export default app
