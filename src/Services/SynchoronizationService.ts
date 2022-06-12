import { SharedDocument } from '../Domain/SharedDocument'
import * as Y from 'yjs'
import { BlogNotExists } from '../Errors/HierarchyError'
import HierarchyRepo from '../Repositories/HierarchyRepo'

class SynchronizationService {
    private hierarchyMap = new Map<number, SharedDocument>()

    getHierarchy (userId: number) {
        const existing = this.hierarchyMap.get(userId)
        if (existing) {
            return {
                document: existing,
                isNew: false
            }
        }

        const document = new SharedDocument(userId)
        document.gc = true
        this.hierarchyMap.set(userId, document)
        return {
            document,
            isNew: true
        }
    }

    async getHierarchyV2 (userId: number) {
        const {
            document,
            isNew
        } = this.getHierarchy(userId)
        if (isNew) {
            const user = await HierarchyRepo.getHierarchy(userId)
            if (!user) {
                throw new BlogNotExists()
            }
            Y.applyUpdate(document, Y.encodeStateAsUpdate(user))
        }
        return document
    }

    deleteHierarchy (userId: number) {
        this.hierarchyMap.delete(userId)
    }

    getServiceStats () {
        const documents = this.hierarchyMap.values()
        let documentCount = 0
        let totalUserCount = 0
        let maxUserCount = 0
        let maxUserID = null
        for (const document of documents) {
            documentCount += 1
            const documentUserCount = [...document.socketMap.values()].length
            totalUserCount += documentUserCount
            if (documentUserCount > maxUserCount) {
                maxUserCount = documentUserCount
                maxUserID = document.id
            }
        }
        return {
            documentCount,
            totalUserCount,
            maxUserCount,
            maxUserID
        }
    }
}
export default new SynchronizationService()
