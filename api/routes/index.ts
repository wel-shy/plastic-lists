import { Express } from 'express'

import home from './home'
import api from './api'

/**
 * Add routes to app
 * @param  '/'   [description]
 * @param  home( [description]
 * @return       [description]
 */
export const addRoutes = (app: Express, wss: any) => {
  app.use('/', home())
  app.use('/api', api(wss))
  return app
}
