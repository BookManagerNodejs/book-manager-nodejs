const Redis = require('ioredis');
const env = require('./env');

let client;
function getRedis() {
    if (!client) {
        client = new Redis(env.redisUrl, {
            lazyConnect: false, // connect ngay
        });
        client.on('error', (err) => console.error('[Redis] error:', err));
        client.on('connect', () => console.log('[Redis] connected'));
    }
    return client;
}
module.exports = { getRedis };
