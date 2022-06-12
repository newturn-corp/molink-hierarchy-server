import { SaveBlogInternalDTO, SetHeaderIconActiveDTO } from '@newturn-develop/types-molink'
import * as Y from 'yjs'
import HierarchyRepo from '../Repositories/HierarchyRepo'
import SynchoronizationService from './SynchoronizationService'
import User from '../Domain/User'
import { UnauthorizedForBlog } from '../Errors/HierarchyError'

export class BlogService {
    async saveBlog (dto: SaveBlogInternalDTO) {
        const doc = new Y.Doc()
        doc.getMap('documentHierarchyInfoMap')
        doc.getArray('topLevelDocumentIdList')

        const setting = doc.getMap('setting')
        setting.set('headerIconActive', false)
        await HierarchyRepo.persistHierarchyUpdate(dto.userId, Y.encodeStateAsUpdate(doc))
    }

    async setHeaderIconActive (user: User, dto: SetHeaderIconActiveDTO) {
        if (user.id !== dto.id) {
            throw new UnauthorizedForBlog()
        }

        const hierarchy = await SynchoronizationService.getHierarchyV2(dto.id)
        const setting = hierarchy.getMap('setting')
        setting.set('headerIconActive', dto.active)
        if (hierarchy.destoryable) {
            hierarchy.destroy()
        }
    }
}
