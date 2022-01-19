import ContentRepo from '../Repositories/ContentRepo'
import DocumentRepo from '../Repositories/DocumentRepo'
import { CreateDocumentDTO, DocumentVisibility, HierarchyDocumentInfoInterface } from '@newturn-develop/types-molink'

class DocumentService {
    async createDocument (userId: number, dto: CreateDocumentDTO): Promise<HierarchyDocumentInfoInterface> {
        const defaultTitle = ''
        const defaultIcon = '📄'
        const defaultVisibility: DocumentVisibility = DocumentVisibility.Private
        const defaultContent = [{
            type: 'title',
            children: [{ text: '' }]
        }, {
            type: 'text',
            category: 'content3',
            children: [{ text: '' }]
        }]

        const contentId = await ContentRepo.saveContent(defaultContent)
        const editionInfoId = await DocumentRepo.saveDocumentEditionInfo(userId)

        const documentId = await DocumentRepo.saveDocument(userId, defaultTitle, defaultVisibility, defaultIcon, dto.parentId, dto.order, dto.location, contentId, editionInfoId)
        return {
            id: documentId,
            title: defaultTitle,
            icon: defaultIcon,
            userId,
            ...dto
        }
    }
}
export default new DocumentService()
