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
}
export default new SynchronizationService()
