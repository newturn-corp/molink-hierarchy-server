import Automerge from 'automerge'
import { Client } from '../Client'
import { HierarchyNotExists } from '../Errors/HierarchyError'
import CacheService from './CacheService'
import {
    HierarchyChildrenOpenInfoInterface,
    AutomergeChangeEventDTO
} from '@newturn-develop/types-molink'
import { getAutomergeDocumentFromRedis, setAutomergeDocumentAtRedis } from '@newturn-develop/molink-utils'
import { v4 as uuidV4 } from 'uuid'
import User from '../Domain/User'
import { getHierarchyCacheKey, getHierarchyChildrenOpenCacheKey } from '@newturn-develop/molink-constants'
import { convertAutomergeChangesThroughNetwork } from '@newturn-develop/molink-automerge-wrapper'

class SynchronizationService {
    private infoMap = new Map<string, Automerge.FreezeObject<HierarchyChildrenOpenInfoInterface>>()
    private clientsHierarchyDependencyMap = new Map<string, Map<string, Client>>()

    private getKeyByClient (client: Client) {
        return `${client.hierarchyUser?.id}-${client.user?.id}`
    }

    async registerClient (client: Client) {
        const key = this.getKeyByClient(client)
        const user = client.user as User
        const hierarchyUser = client.hierarchyUser as User
        if (!this.infoMap.has(key)) {
            const info = await getAutomergeDocumentFromRedis<HierarchyChildrenOpenInfoInterface>(CacheService.redis, getHierarchyChildrenOpenCacheKey(hierarchyUser.id, user.id))
            if (!info) {
                throw new HierarchyNotExists()
            }
            this.infoMap.set(key, info)
        }
        const dependency = this.clientsHierarchyDependencyMap.get(key)
        if (!dependency) {
            this.clientsHierarchyDependencyMap.set(key, new Map())
        }
        this.clientsHierarchyDependencyMap.get(key)?.set(client.id, client)
        console.log(`client ${client.id} registered at ${key}`)
    }

    deregisterClient (client: Client) {
        const key = this.getKeyByClient(client)

        this.clientsHierarchyDependencyMap.get(key)?.delete(client.id)
        console.log(`client ${client.id} deregistered at ${key}`)
    }

    public async handleChanges (client: Client, changeId: string, changes: Automerge.BinaryChange[]) {
        const key = this.getKeyByClient(client)
        const user = client.user as User
        const hierarchyUser = client.hierarchyUser as User
        const info = this.infoMap.get(key)
        if (!info) {
            throw new HierarchyNotExists()
        }
        const [newInfo] = Automerge.applyChanges(info, changes)
        this.infoMap.set(key, newInfo)
        await setAutomergeDocumentAtRedis(CacheService.redis, getHierarchyChildrenOpenCacheKey(hierarchyUser.id, user.id), newInfo)

        const dependencyClients = this.clientsHierarchyDependencyMap.get(key)?.values()
        if (!dependencyClients) {
            return
        }

        for (const dependencyClient of dependencyClients) {
            if (client.id === dependencyClient.id) {
                continue
            }
            console.log(`client ${client.id}: send hierarchy children open change event`)
            dependencyClient.socket.emit('hierarchy-children-open-change', new AutomergeChangeEventDTO(changeId, convertAutomergeChangesThroughNetwork(changes)))
        }
    }
}
export default new SynchronizationService()
