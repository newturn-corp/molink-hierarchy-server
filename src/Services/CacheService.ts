import env from '../env'
import Redis from 'ioredis'

class CacheService {
    publisher: any
    subscriber: any

    constructor () {
        this.publisher = new Redis(env.redis)
        this.subscriber = new Redis(env.redis)
    }
}
export default new CacheService()
