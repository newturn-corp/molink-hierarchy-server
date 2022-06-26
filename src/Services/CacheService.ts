import env from '../env'
import Redis from 'ioredis'
import { RedisConnector } from '@newturn-develop/molink-utils'
import { HierarchyDocumentInfoInterface } from '@newturn-develop/types-molink'

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

    async savePageStatusInRedis (page: HierarchyDocumentInfoInterface) {
        console.log(`save page status in redis page-${page.id}`)
        await this.main.setWithEx(`page-${page.id}`, JSON.stringify(page), 1800)
    }
}
export default new CacheService()
