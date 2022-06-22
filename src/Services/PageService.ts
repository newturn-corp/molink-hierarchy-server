import {
    CreatePageInBlogDTO,
    HierarchyDocumentInfoInterface,
    PageVisibility
} from '@newturn-develop/types-molink'
import CacheService from './CacheService'
import SynchronizationService from './SynchoronizationService'

export class PageService {
    async createPage (userId: number, dto: CreatePageInBlogDTO) {
        const { order, parentId, blogID } = dto
        const blog = await SynchronizationService.getBlog(blogID)

        const newPage: HierarchyDocumentInfoInterface = {
            id: dto.id,
            title: dto.title || '새 페이지',
            icon: dto.icon || '📄',
            userId,
            visibility: PageVisibility.Private,
            order: dto.order,
            parentId: dto.parentId,
            childrenOpen: false,
            fileUsage: 0,
            children: []
        }

        const yMap = blog.getMap('pageInfoMap')
        const yTopLevelDocumentIdList = blog.getArray('topLevelPageIDList')

        blog.transact(() => {
            yMap.set(newPage.id, newPage)
            if (parentId === null) {
                yTopLevelDocumentIdList.insert(order, [newPage.id])

                for (const [index, pageId] of yTopLevelDocumentIdList.toArray().entries()) {
                    const page = yMap.get(pageId as string) as HierarchyDocumentInfoInterface
                    page.order = index
                    yMap.set(pageId as string, page)
                }
            } else {
                const parent = yMap.get(parentId) as HierarchyDocumentInfoInterface
                parent.children.splice(order, 0, newPage.id)
                for (const [index, pageId] of parent.children.entries()) {
                    const page = yMap.get(pageId) as HierarchyDocumentInfoInterface
                    page.order = index
                    yMap.set(pageId, page)
                }
                parent.childrenOpen = true
                yMap.set(parentId, parent)
            }
        }, 'server')
        if (blog.destoryable) {
            blog.destroy()
        }

        await CacheService.main.setWithEx(`page-${dto.id}`, JSON.stringify(newPage), 1800)
        return newPage
    }
}
