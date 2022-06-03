import { CreatePageInBlogDTO, HierarchyDocumentInfoInterface, PageVisibility } from '@newturn-develop/types-molink'
import CacheService from './CacheService'
import SynchronizationService from './SynchoronizationService'
import HierarchyRepo from '../Repositories/HierarchyRepo'
import * as Y from 'yjs'
import { ChildrenVisibilityWide, PageNotExists, ParentVisibilityNarrow } from '../Errors/HierarchyError'
import { checkVisibilityWide, getChildren, getParents } from '@newturn-develop/molink-utils'
import ESPageRepo from '../Repositories/ESPageRepo'

export class PageService {
    async createPage (userId: number, dto: CreatePageInBlogDTO) {
        const { order, parentId } = dto
        const { document, isNew } = SynchronizationService.getHierarchy(userId)
        if (isNew) {
            let hierarchy = await HierarchyRepo.getHierarchy(userId)
            if (!hierarchy) {
                hierarchy = new Y.Doc()
                await HierarchyRepo.persistHierarchyUpdate(userId, Y.encodeStateAsUpdate(hierarchy))
            }

            Y.applyUpdate(document, Y.encodeStateAsUpdate(hierarchy))
        }

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

        const yMap = document.getMap('documentHierarchyInfoMap')
        const yTopLevelDocumentIdList = document.getArray('topLevelDocumentIdList')

        document.transact(() => {
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
        if (document.destoryable) {
            document.destroy()
        }

        await CacheService.main.setWithEx(`page-${dto.id}`, JSON.stringify(newPage), 1800)
        return newPage
    }
}
