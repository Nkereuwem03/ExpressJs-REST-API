const redis = require('redis')

const client = redis.createClient()
client.connect()

client.on('error', (err) => console.log('Redis Error:', err))

module.exports = client