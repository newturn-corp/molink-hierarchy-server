
import { Client } from '../Client'
import DocumentService from '../Services/DocumentService'
import HierarchyService from '../Services/HierarchyService'
import { AutomergeChangeEventDTO, AutomergeDocumentDTO } from '@newturn-develop/types-molink'
import {
    getAutomergeChangesThroughNetwork,
    getAutomergeDocumentThroughNetwork
} from '@newturn-develop/molink-automerge-wrapper'
import HierarchyChildrenOpenService from '../Services/HierarchyChildrenOpenService'

export class MainController {
    userId: number
    client: Client

    constructor (userId: number, client: Client) {
        this.userId = userId
        this.client = client

        if (userId === client.hierarchyUser?.id) {
            client.socket.on('hierarchy-change', (dto: AutomergeChangeEventDTO) => this.handleHierarchyChange(dto))
            client.socket.on('hierarchy-merge', (dto: AutomergeDocumentDTO) => this.handleMerge(dto))
        }
        client.socket.on('hierarchy-children-open-change', (data: AutomergeChangeEventDTO) => this.handleHierarchyChildrenOpenChange(data))
        client.socket.on('disconnect', () => this.handleDisconnect())
    }

    async handleMerge (dto: AutomergeDocumentDTO) {
        await HierarchyService.handleMerge(this.client, getAutomergeDocumentThroughNetwork(dto.document))
    }

    async handleHierarchyChange (dto: AutomergeChangeEventDTO) {
        await HierarchyService.handleChanges(this.client, getAutomergeChangesThroughNetwork(dto.changes))
    }

    async handleHierarchyChildrenOpenChange (dto: AutomergeChangeEventDTO) {
        await HierarchyChildrenOpenService.handleChanges(this.client, dto.changeId, getAutomergeChangesThroughNetwork(dto.changes))
    }

    async handleDisconnect () {
        this.client.socket.leave(this.client.socket.id)
        HierarchyService.deregisterClient(this.client)
    }
}
