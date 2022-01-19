import env from '../env'
import { RedisConnector } from '@newturn-develop/molink-utils'

class CacheService {
    hierarchyLiveRedis: RedisConnector
    redis: RedisConnector

    constructor () {
        this.hierarchyLiveRedis = new RedisConnector(env.redis.hierarchyLive.host, env.redis.hierarchyLive.port)
        this.hierarchyLiveRedis.connect()
        this.redis = new RedisConnector(env.redis.host, env.redis.port)
        this.redis.connect()
    }
}
export default new CacheService()
