
import CloudflareWorkerGlobalScope from 'types-cloudflare-worker'
declare var self: CloudflareWorkerGlobalScope

export class Worker {
  public async handle(event: FetchEvent) {
    const { request } = event
    const { headers } = request
    const response = await fetch(request)

    const authKey    = process.env.AUTH_KEY as string
    const logBaseURL = process.env.LOG_BASE_URL as string

    // Send log
    const logReq = fetch(`${logBaseURL}/requests`, {
      method : 'POST',
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': authKey
      },
      body  : JSON.stringify({
        ip        : headers.get('cf-connecting-ip'),
        path      : new URL(request.url).pathname,
        host      : headers.get('host'),
        country   : request.cf.country,
        user_agent: headers.get('user-agent')
      })
    })

    event.waitUntil(logReq)

    return response
  }
}

self.addEventListener('fetch', (event: FetchEvent) => {
  const worker = new Worker()

  event.respondWith(worker.handle(event))
})
