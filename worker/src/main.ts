
import CloudflareWorkerGlobalScope from 'types-cloudflare-worker'
declare var self: CloudflareWorkerGlobalScope

const authKey    = process.env.AUTH_KEY as string
const logBaseURL = process.env.LOG_BASE_URL as string

interface cloudflareLog {
  ip          : string
  path        : string
  host        : string
  country     : string | null
  userAgent   : string
  bodyLength  : number | string
  statusCode  : number
  contentType?: string
  cache?      : string
  origin?     : string
  referrer?   : string
}

export class Worker {
  public async handle(event: FetchEvent) {
    const { request } = event
    const { headers } = request
    const { cf }      = request

    const response   = await fetch(request)
    const resHeaders = response.headers
    const parsedURL  = new URL(request.url)

    // Send log
    const log: cloudflareLog = {
      ip        : headers.get('cf-connecting-ip')!,
      host      : headers.get('host')!,
      userAgent : headers.get('user-agent')!,
      bodyLength: resHeaders.get('content-length') || (await response.clone().text()).length,
      path      : parsedURL.pathname,
      country   : cf ? cf.country : null,
      statusCode: response.status
    }

    const cacheStatus = resHeaders.get('cf-cache-status') || resHeaders.get('x-now-cache')
    const origin      = headers.get('origin')
    const referrer    = headers.get('referer')
    const contentType = headers.get('content-type')

    if (contentType) {
      log.contentType = contentType.split(';')[0]
    } if (cacheStatus) {
      log.cache = cacheStatus
    } if (origin) {
      log.origin = origin
    } if (referrer) {
      log.referrer = referrer
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
