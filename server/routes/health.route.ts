import { Hono } from 'hono'

export const healthRouter = new Hono()
  .get('/', (c) => {
    return c.json({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    })
  })
