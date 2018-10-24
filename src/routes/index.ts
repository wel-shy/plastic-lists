import { Express } from 'express'

import home from './home'
import api from './api'

/**
 * Add routes to app
 * @param  '/'   [description]
 * @param  home( [description]
 * @return       [description]
 */
export const addRoutes = (app: Express) => {
  app.use('/', home())
  app.use('/api', api())
  return app
}
