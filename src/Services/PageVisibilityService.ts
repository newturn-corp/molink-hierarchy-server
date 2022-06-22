import { ChangePageVisibilityDTO, HierarchyDocumentInfoInterface, User } from '@newturn-develop/types-molink'
import SynchronizationService from './SynchoronizationService'
import { ChildrenVisibilityWide, PageNotExists, ParentVisibilityNarrow } from '../Errors/HierarchyError'
import { checkVisibilityWide, getChildren, getParents } from '@newturn-develop/molink-utils'
import CacheService from './CacheService'
import ESPageRepo from '../Repositories/ESPageRepo'

class PageVisibilityService {
    async changePageVisibility (user: User, dto: ChangePageVisibilityDTO) {
        const { pageId, visibility, force, blogID } = dto
        const targetPages: string[] = []

        const blog = await SynchronizationService.getBlog(blogID)
        const yMap = blog.getMap('pageInfoMap')
        const map = yMap.toJSON()

        const page = map[pageId] as HierarchyDocumentInfoInterface
        if (!page) {
            throw new PageNotExists()
        }
        if (page.visibility === visibility) {
            return
        }

        blog.transact(() => {
            if (checkVisibilityWide(visibility, page.visibility) === 1) {
                const parentIDList = getParents(map, pageId)
                const narrowParentIDList = parentIDList.filter(parentID => {
                    const parent = map[parentID]
                    return checkVisibilityWide(parent.visibility, visibility) === -1
                })
                if (narrowParentIDList.length > 0) {
                    if (!force) {
                        throw new ParentVisibilityNarrow()
                    }
                    for (const parentID of narrowParentIDList) {
                        const parent = map[parentID]
                        parent.visibility = visibility
                        targetPages.push(parent.id)
                        CacheService.savePageStatusInRedis(parent)
                        yMap.set(parent.id, parent)
                    }
                }
            } else {
                // 현재보다 좁게 바꾸는 경우 자식 중, 이 페이지의 공개 범위보다 넓은 자식이 있다면 수정을 제안해야 한다.
                const childrenIDList = getChildren(map, pageId)
                const wideChildrenIDList = childrenIDList.filter((childID: string) => {
                    const child = map[childID]
                    // 버그 방지 (getChildren 주석 참고)
                    if (child.id === pageId) {
                        return false
                    }
                    return checkVisibilityWide(child.visibility, visibility) === 1
                })
                if (wideChildrenIDList.length > 0) {
                    if (!force) {
                        throw new ChildrenVisibilityWide()
                    }
                    for (const childID of wideChildrenIDList) {
                        const child = map[childID]
                        child.visibility = visibility
                        targetPages.push(child.id)
                        CacheService.savePageStatusInRedis(child)
                        yMap.set(child.id, child)
                    }
                }
            }
            page.visibility = visibility
            targetPages.push(page.id)
            CacheService.savePageStatusInRedis(page)
            yMap.set(page.id, page)
        }, 'server')
        if (blog.destoryable) {
            blog.destroy()
        }

        await ESPageRepo.setPagesVisibility(targetPages, visibility)
    }
}
export default new PageVisibilityService()
