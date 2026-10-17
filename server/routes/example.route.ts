import { Hono } from 'hono'

export const exampleRouter = new Hono()
  .get('/message', (c) => {
    return c.json({
      title: 'Full-Stack Boilerplate',
      description: 'Next.js + TypeScript + shadcn/ui + Hono'
    })
  })
  .post('/echo', async (c) => {
    try {
      const body = await c.req.json<{ text?: string }>()
      const text = body?.text ?? 'No text provided'
      return c.json({
        received: text,
        reply: `Echo: "${text}" processed on server`
      })
    } catch {
      return c.json(
        {
          received: '',
          reply: 'Invalid or missing JSON payload'
        },
        400
      )
    }
  })
