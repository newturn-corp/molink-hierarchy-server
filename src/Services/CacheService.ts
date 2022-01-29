import env from '../env'
import { RedisConnector } from '@newturn-develop/molink-utils'

class CacheService {
    redis: RedisConnector
    contentRedis: RedisConnector

    constructor () {
        this.redis = new RedisConnector(env.redis.host, env.redis.port)
        this.redis.connect()
        this.contentRedis = new RedisConnector(env.redis.content.host, env.redis.content.port)
        this.contentRedis.connect()
    }
}
export default new CacheService()
