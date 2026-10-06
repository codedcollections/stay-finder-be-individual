import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { prettyJSON } from 'hono/pretty-json'

import { optionalAuth } from './middleware/auth.js'
import properties from './routes/properties.js'
import bookings from './routes/bookings.js'
import auth from './routes/auth.js'

const app = new Hono({ strict: false })

app.use(prettyJSON())

app.use('*', optionalAuth)

app.get('/', (c) => {
  return c.json({
    name: "Stay Finder"

  })
})

//test comment
app.route("/properties",properties)
app.route("/bookings",bookings)
app.route("/auth",auth)

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
