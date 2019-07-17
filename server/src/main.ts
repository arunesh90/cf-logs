import 'source-map-support/register'
import 'dotenv/config'

if (!process.env.AUTH_KEY) {
  console.error('Missing env variable AUTH_KEY for worker authentication')
  process.exit(1)
}

import express from 'express'
import { Counter, register } from 'prom-client'
import bodyParser = require('body-parser');

export const webServer = express()

const metrics = {
  requests: new Counter({
    name: 'cf_requests',
    help: 'The number of requests',
    labelNames: ['path', 'host', 'ip', 'country', 'user_agent']
  })
}

webServer.use(bodyParser.json())
webServer.use((req, res, next) => { 
  const authKey = req.headers['authorization'] || req.query['key']

  if (!authKey || authKey !== process.env.AUTH_KEY) {
    res.status(403).send('Missing auth key')
    return
  }

  next()
})

webServer.get('/metrics', (_zreq, res) => {
  res.set('Content-Type', register.contentType)
  res.end(register.metrics())
})


webServer.post('/requests', (req, res) => {
  const { body } = req

  metrics.requests.inc({
    ip        : body.ip,
    path      : body.path,
    host      : body.host,
    country   : body.country,
    user_agent: body.user_agent
  })

  res.sendStatus(204)
})

webServer.listen(80, () => {
  console.log('Listening on port 80')
})
