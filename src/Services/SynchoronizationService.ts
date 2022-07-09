import { SharedDocument } from '../Domain/SharedDocument'
import * as Y from 'yjs'
import { BlogNotExists } from '../Errors/HierarchyError'
import BlogRepo from '../Repositories/LiveBlogRepo'

class SynchronizationService {
    private blogMap = new Map<number, SharedDocument>()

    getRawBlog (blogID: number) {
        const existing = this.blogMap.get(blogID)
        if (existing) {
            return {
                document: existing,
                isNew: false
            }
        }

        const document = new SharedDocument(blogID)
        document.gc = true
        this.blogMap.set(blogID, document)
        return {
            document,
            isNew: true
        }
    }

    async syncWithDB (blogID: number, document: Y.Doc) {
        const persistedBlog = await BlogRepo.getBlog(blogID)
        if (!persistedBlog) {
            throw new BlogNotExists()
        }
        Y.applyUpdate(document, Y.encodeStateAsUpdate(persistedBlog))
    }

    async getBlog (blogID: number) {
        const existing = this.blogMap.get(blogID)
        if (existing) {
            return existing
        }
        const persistedBlog = await BlogRepo.getBlog(blogID)
        if (!persistedBlog) {
            throw new BlogNotExists()
        }
        const document = new SharedDocument(blogID)
        document.gc = true
        this.blogMap.set(blogID, document)
        Y.applyUpdate(document, Y.encodeStateAsUpdate(persistedBlog))
        return document
    }

    deleteBlog (blogID: number) {
        this.blogMap.delete(blogID)
    }

    getServiceStats () {
        const documents = this.blogMap.values()
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
