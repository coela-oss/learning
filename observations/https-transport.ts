import { lookup } from 'node:dns/promises'
import { request } from 'node:https'
import type { Dependencies } from './types.ts'
export const officialTransport: Dependencies = {
  now: () => new Date(),
  async lookup(host) {
    const addresses = await lookup(host, { all: true, verbatim: true })
    return addresses.map(a => ({ address: a.address, family: a.family === 6 ? 6 : 4 }))
  },
  request(url, address, signal) {
    return new Promise((resolve, reject) => {
      const req = request(url, {
        method: 'GET', agent: false, signal, family: address.family,
        headers: { accept: 'text/html, text/plain, application/json', 'accept-encoding': 'identity', 'user-agent': 'private-learning-source-review/1' },
        // Pin the validated DNS result. TLS still verifies the original hostname.
        lookup: (_hostname, _options, callback) => callback(null, address.address, address.family)
      }, response => resolve({
        status: response.statusCode ?? 0,
        headers: {
          'content-type': String(response.headers['content-type'] ?? ''),
          'content-length': String(response.headers['content-length'] ?? ''),
          'content-encoding': String(response.headers['content-encoding'] ?? ''),
          'last-modified': String(response.headers['last-modified'] ?? ''),
          location: response.headers.location
        },
        body: response, close: () => response.destroy()
      }))
      req.once('error', reject); req.end()
    })
  }
}
