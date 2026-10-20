import { domains } from './learning/domains'
import { lessonFiles } from './learning/catalog'
const ids = [...new Set(lessonFiles.map(path => path.split('/').at(-1)!.split('.')[0]!))]
const routes = ['', '/ja'].flatMap(prefix => [prefix || '/',
  ...domains.map(domain => `${prefix}/domains/${domain.id}`),
  ...ids.map(id => `${prefix}/lessons/${id}`)])
export default defineNuxtConfig({
  compatibilityDate: '2026-10-16',
  devtools: { enabled: false },
  telemetry: false,
  css: ['~/assets/main.css'],
  typescript: { strict: true },
  sourcemap: { server: false, client: false },
  app: { head: { meta: [{ name: 'robots', content: 'noindex, nofollow' }] } },
  nitro: { prerender: { routes, crawlLinks: true, failOnError: true } }
})
