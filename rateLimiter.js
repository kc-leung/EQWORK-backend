const redis = require('ioredis')

const client = redis.createClient(process.env.REDIS_URL)

client.on('error', err => console.log(`Error ${err}`))

const rateLimiter = async (req, res, next) => {
  async function isOverLimit(ip) {
    let res

    try {
      res = await client.incr(ip)
    } catch (err) {
      console.error('isOverLimit: could not increment key')
      throw err
    }

    if (res > 10) {
      return true
    }
    client.expire(ip, 10)
  }

  let overLimit = await isOverLimit(req.ip)

  if (overLimit) {
    res.status(429).send('Too many requests - try again later')
    return
  }

  return next()
}

module.exports = { rateLimiter }