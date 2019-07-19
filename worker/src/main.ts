
import CloudflareWorkerGlobalScope from 'types-cloudflare-worker'
declare var self: CloudflareWorkerGlobalScope

interface cloudflareLog {
  ip        : string,
  path      : string,
  host      : string,
  country   : string | null,
  user_agent: string,
  cache?    : string,
  origin?   : string
}

export class Worker {
  public async handle(event: FetchEvent) {
    const { request } = event
    const { headers } = request
    const { cf }      = request

    const response   = await fetch(request)
    const resHeaders = response.headers

    const authKey    = process.env.AUTH_KEY as string
    const logBaseURL = process.env.LOG_BASE_URL as string

    // Send log
    const log: cloudflareLog = {
      ip        : headers.get('cf-connecting-ip')!,
      path      : new URL(request.url).pathname,
      host      : headers.get('host')!,
      country   : cf ? cf.country : null,
      user_agent: headers.get('user-agent')!
    }

    const cacheStatus = resHeaders.get('cf-cache-status') || resHeaders.get('x-now-cache')
    const origin      = headers.get('origin')

    if (cacheStatus) {
      log.cache = cacheStatus
    } if (origin) {
      log.origin = origin
    }

    const logReq = fetch(`${logBaseURL}/requests`, {
      method : 'POST',
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': authKey
      },
      body  : JSON.stringify(log)
    })

    event.waitUntil(logReq)

    return response
  }
}

self.addEventListener('fetch', (event: FetchEvent) => {
  const worker = new Worker()

  event.respondWith(worker.handle(event))
})
