import { SaveBlogInternalDTO } from '@newturn-develop/types-molink'
import * as Y from 'yjs'
import HierarchyRepo from '../Repositories/HierarchyRepo'

export class BlogService {
    async saveBlog (dto: SaveBlogInternalDTO) {
        const doc = new Y.Doc()
        doc.getMap('documentHierarchyInfoMap')
        doc.getArray('topLevelDocumentIdList')
        await HierarchyRepo.persistHierarchyUpdate(dto.userId, Y.encodeStateAsUpdate(doc))
    }
}
