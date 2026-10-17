import { Hono } from 'hono'
import { healthRouter } from './routes/health.route'
import { exampleRouter } from './routes/example.route'

const app = new Hono().basePath('/api')

// Chain routes for end-to-end type inference
const routes = app
  .route('/health', healthRouter)
  .route('/example', exampleRouter)

export type AppType = typeof routes
export default routes
