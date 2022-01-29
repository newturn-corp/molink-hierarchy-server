import { CreateDocumentDTO } from '@newturn-develop/types-molink'
import { setAutomergeDocumentAtRedis } from '@newturn-develop/molink-utils'
import CacheService from './CacheService'
import Automerge from 'automerge'

class ContentService {
    async createDocument (dto: CreateDocumentDTO) {
        const document = Automerge.from({
            children: [{
                type: 'title',
                children: [{ text: '' }]
            }, {
                type: 'text',
                category: 'content3',
                children: [{ text: '' }]
            }],
            cursor: null,
            lastUsedAt: new Date()
        })
        await setAutomergeDocumentAtRedis(CacheService.contentRedis, dto.id, document)
    }
}
export default new ContentService()
