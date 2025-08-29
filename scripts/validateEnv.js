const required = ['WP_URL','JWT_SECRET','NEXT_REVALIDATE_SECRET','NEXT_PUBLIC_SITE_URL']
const missing = required.filter(k => !process.env[k])
if (process.env.NODE_ENV === 'production' && missing.length>0) {
  console.error('Missing required env vars:', missing.join(', '))
  process.exit(1)
}
console.log('Env looks OK')
