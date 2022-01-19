import { CreateDocumentDTO, CreateDocumentResponseDTO } from '@newturn-develop/types-molink'
import { Client } from '../Client'
import DocumentService from '../Services/DocumentService'
import HierarchyService from '../Services/HierarchyService'

export class MainController {
    userId: number
    client: Client

    constructor (userId: number, client: Client) {
        this.userId = userId
        this.client = client

        client.socket.on('createDocument', (data: CreateDocumentDTO) => this.handleCreateDocument(data))
        client.socket.on('disconnect', () => this.handleDisconnect())
    }

    async handleCreateDocument (data: CreateDocumentDTO) {
        const info = await DocumentService.createDocument(this.userId, data)
        HierarchyService.handleCreateNewDocument(this.client, info)
        this.client.socket.emit('createDocumentResponse', new CreateDocumentResponseDTO(info.id))
    }

    async handleDisconnect () {
        this.client.socket.leave(this.client.socket.id)
        HierarchyService.deregisterClient(this.client)
    }
}
