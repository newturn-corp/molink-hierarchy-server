import Automerge from 'automerge'
import { Client } from '../Client'
import { HierarchyChangeTimeout, HierarchyNotExists, InvalidDocumentLocation } from '../Errors/HierarchyError'
import CacheService from './CacheService'
import {
    HierarchyDocumentInfoInterface,
    HierarchyInfoInterface,
    HierarchyChangeEventDTO,
    AutomergeChangeEventDTO, AutomergeDocumentDTO
} from '@newturn-develop/types-molink'
import { getAutomergeDocumentFromRedis, setAutomergeDocumentAtRedis } from '@newturn-develop/molink-utils'
import User from '../Domain/User'
import { v4 as uuidV4 } from 'uuid'
import { getHierarchyCacheKey } from '@newturn-develop/molink-constants'
import { convertAutomergeDocumentForNetwork } from '@newturn-develop/molink-automerge-wrapper'

class HierarchyService {
    private hierarchyMap = new Map<number, Automerge.FreezeObject<HierarchyInfoInterface>>()
    private clientsHierarchyDependencyMap = new Map<number, Map<string, Client>>()

    async registerClient (client: Client) {
        const hierarchyUser = client.hierarchyUser as User
        if (!this.hierarchyMap.has(hierarchyUser.id)) {
            const hierarchy = await getAutomergeDocumentFromRedis<HierarchyInfoInterface>(CacheService.redis, getHierarchyCacheKey(hierarchyUser.id))
            if (!hierarchy) {
                throw new HierarchyNotExists()
            }
            this.hierarchyMap.set(hierarchyUser.id, hierarchy)
        }
        const dependency = this.clientsHierarchyDependencyMap.get(hierarchyUser.id)
        if (!dependency) {
            this.clientsHierarchyDependencyMap.set(hierarchyUser.id, new Map())
        }
        this.clientsHierarchyDependencyMap.get(hierarchyUser.id)?.set(client.id, client)
        console.log(`client ${client.id} registered at ${hierarchyUser.nickname}'s hierarchy`)
    }

    deregisterClient (client: Client) {
        const hierarchyUser = client.hierarchyUser as User
        this.clientsHierarchyDependencyMap.get(hierarchyUser.id)?.delete(client.id)
        console.log(`client ${client.id} deregistered at ${hierarchyUser.nickname}'s hierarchy`)
    }

    public async handleChanges (client: Client, dto: AutomergeChangeEventDTO) {
        console.log(`handle change from ${client.id}`)
        const hierarchyUser = client.hierarchyUser as User
        const hierarchy = this.hierarchyMap.get(hierarchyUser.id)
        if (!hierarchy) {
            throw new HierarchyNotExists()
        }
        const [newHierarchy] = Automerge.applyChanges(hierarchy, dto.changes)
        this.hierarchyMap.set(hierarchyUser.id, newHierarchy)
        await setAutomergeDocumentAtRedis(CacheService.redis, getHierarchyCacheKey(hierarchyUser.id), newHierarchy)

        const dependencyClients = this.clientsHierarchyDependencyMap.get(hierarchyUser.id)?.values()
        if (!dependencyClients) {
            return
        }

        for (const dependencyClient of dependencyClients) {
            if (client.id === dependencyClient.id) {
                continue
            }
            console.log(`client ${client.id}: send hierarchy change event`)
            dependencyClient.socket.emit('change', dto)
        }
    }

    public async handleMerge (client: Client, localHierarchy: Automerge.FreezeObject<HierarchyInfoInterface>) {
        console.log(`handle merge from ${client.id}`)
        const hierarchyUser = client.hierarchyUser as User
        const hierarchy = this.hierarchyMap.get(hierarchyUser.id)
        if (!hierarchy) {
            throw new HierarchyNotExists()
        }
        const mergedHierarchy = Automerge.merge(hierarchy, localHierarchy)
        this.hierarchyMap.set(hierarchyUser.id, mergedHierarchy)
        await setAutomergeDocumentAtRedis(CacheService.redis, getHierarchyCacheKey(hierarchyUser.id), mergedHierarchy)

        const dependencyClients = this.clientsHierarchyDependencyMap.get(hierarchyUser.id)?.values()
        if (!dependencyClients) {
            return
        }

        for (const dependencyClient of dependencyClients) {
            if (client.id === dependencyClient.id) {
                continue
            }
            console.log(`client ${client.id}: send hierarchy merge event`)
            dependencyClient.socket.emit('hierarchy-merge', new AutomergeDocumentDTO(convertAutomergeDocumentForNetwork(mergedHierarchy)))
        }
    }
}
export default new HierarchyService()
