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

    // async deleteDocument (user: User, dto: DeleteDocumentDto) {
    //     const document = await DocumentRepo.getDocument(dto.id)
    //     if (document?.userId !== user.id) {
    //         throw new DocumentActionForbidden()
    //     }
    //     if (user.representative_document_id === document.id) {
    //         await UserRepo.setUserRepresentativeDocumentId(user.id, null)
    //     }
    //     await DocumentRepo.decreaseDocumentsOrder(dto.parentId, dto.order)
    //     await this.deleteChild(user, dto.id)
    //     await DocumentRepo.deleteDocument(dto.id)
    //     await ContentRepo.deleteContent(dto.contentId)
    // }
}
export default new DocumentService()
