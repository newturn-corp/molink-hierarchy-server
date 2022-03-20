import { SharedDocument } from '../Domain/SharedDocument'

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
