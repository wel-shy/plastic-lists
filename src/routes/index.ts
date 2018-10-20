import { Express } from 'express'

import home from './home'

/**
 * Add routes to app
 * @param  '/'   [description]
 * @param  home( [description]
 * @return       [description]
 */
export const addRoutes = (app: Express) => {
  app.use('/', home())
  return app
}
