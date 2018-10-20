import * as express from 'express'
import * as cors from 'cors'
import * as cookieParser from 'cookie-parser'
import * as path from 'path'
import { addRoutes } from '../routes'

let app = express()

app.use(express.static(path.join(__dirname, '../../public')))
app.use(cors())
app.use(cookieParser())

app = addRoutes(app)

export default app
