import env from '../env'
import Redis from 'ioredis'
import { RedisConnector } from '@newturn-develop/molink-utils'

class CacheService {
    publisher: any
    subscriber: any
    main: RedisConnector

    constructor () {
        this.publisher = new Redis(env.redis)
        this.subscriber = new Redis(env.redis)
        this.main = new RedisConnector(env.redis.host, env.redis.port, 'hierarchy-redis', true)
        this.main.connect()
    }
}
export default new CacheService()
