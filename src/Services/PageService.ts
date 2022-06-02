import { CreatePageInBlogDTO, HierarchyDocumentInfoInterface, PageVisibility } from '@newturn-develop/types-molink'
import CacheService from './CacheService'

export class PageService {
    async createPage (userId: number, dto: CreatePageInBlogDTO) {
        const spacePageInfo: HierarchyDocumentInfoInterface = {
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
        await CacheService.main.setWithEx(`page-${dto.id}`, JSON.stringify(spacePageInfo), 1800)
        return spacePageInfo
    }
}
