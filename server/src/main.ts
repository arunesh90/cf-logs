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
  all: new Counter({
    name: 'cf_count',
    help: 'Amount of times a worker has added stats'
  }),
  cache: new Counter({
    name      : 'cf_cache_statuses',
    help      : 'Cache status per host',
    labelNames: ['status', 'host']
  }),
  origins: new Counter({
    name      : 'cf_origins',
    help      : 'Amount of times a request has been sent per origin',
    labelNames: ['origin']
  }),
  countries: new Counter({
    name      : 'cf_countries',
    help      : 'Amount of times a request has been sent per country',
    labelNames: ['country']
  }),
  referrers: new Counter({
    name      : 'cf_referrers',
    help      : 'Amount of times has been sent per referrer',
    labelNames: ['referrer']
  }),
  user_agents: new Counter({
    name      : 'cf_user_agents',
    help      : 'Amount of times a request has been sent per user agent',
    labelNames: ['user_agent']
  }),
  clients: new Counter({
    name      : 'cf_client_ips',
    help      : 'Amount of times a request has been sent per client ip',
    labelNames: ['ip']
  }),
  paths: new Counter({
    name      : 'cf_paths',
    help      : 'Amount of times a path has been requested',
    labelNames: ['path', 'host']
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

  metrics.all.inc()
  metrics.paths.inc({
    path: body.path,
    host: body.host
  })
  metrics.countries.inc({
    country: body.country
  })
  metrics.user_agents.inc({
    user_agent: body.user_agent
  })
  metrics.clients.inc({
    ip: body.ip
  })

  if (body.cache) {
    metrics.cache.inc({
      status: body.cache,
      host  : body.host
    })
  } if (body.origin) {
    metrics.origins.inc({
      origin: body.origin
    })
  } if (body.referrer) {
    metrics.referrers.inc({
      referrer: body.referrer
    })
  }

  res.sendStatus(204)
})

webServer.listen(80, () => {
  console.log('Listening on port 80')
})
