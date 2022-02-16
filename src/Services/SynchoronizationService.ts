import { SharedDocument } from '../Domain/SharedDocument'

class SynchronizationService {
    private userInfoMap = new Map<number, SharedDocument>()

    getUserInfo (userId: number) {
        const existing = this.userInfoMap.get(userId)
        if (existing) {
            return {
                document: existing,
                isNew: false
            }
        }

        const document = new SharedDocument(userId)
        document.gc = true
        this.userInfoMap.set(userId, document)
        return {
            document,
            isNew: true
        }
    }

    deleteUserInfo (userId: number) {
        this.userInfoMap.delete(userId)
    }
}
export default new SynchronizationService()
