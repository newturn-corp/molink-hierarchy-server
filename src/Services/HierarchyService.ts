import Automerge from 'automerge'
import { Client } from '../Client'
import { HierarchyNotExists, InvalidDocumentLocation } from '../Errors/HierarchyError'
import CacheService from './CacheService'
import { HierarchyDocumentInfoInterface, HierarchyInfoInterface, HierarchyChangeEventDTO } from '@newturn-develop/types-molink'
import { setAutomergeDocumentAtRedis } from '@newturn-develop/molink-utils'
import User from '../Domain/User'

class HierarchyService {
    private hierarchyMap = new Map<number, Automerge.FreezeObject<HierarchyInfoInterface>>()
    private clientsHierarchyDependencyMap = new Map<number, Map<string, Client>>()

    async registerClient (client: Client) {
        const hierarchyUser = client.hierarchyUser as User
        if (hierarchyUser && !this.hierarchyMap.has(hierarchyUser.id)) {
            const cache = await CacheService.redis.get(`hierarchy-general-${hierarchyUser.id}`)
            if (!cache) {
                throw new HierarchyNotExists()
            }
            const serializedHierarchy = JSON.parse(cache).data
            console.log(serializedHierarchy)
            this.hierarchyMap.set(hierarchyUser.id, Automerge.load(serializedHierarchy))
        }
        const dependency = this.clientsHierarchyDependencyMap.get(hierarchyUser.id)
        if (!dependency) {
            this.clientsHierarchyDependencyMap.set(hierarchyUser.id, new Map())
        }
        this.clientsHierarchyDependencyMap.get(hierarchyUser.id)?.set(client.id, client)
    }

    deregisterClient (client: Client) {
        const hierarchyUser = client.hierarchyUser as User
        this.clientsHierarchyDependencyMap.get(hierarchyUser.id)?.delete(client.id)
    }

    async refreshHierarchyInfoLastUsedAt (userId: number) {
        const cache = await CacheService.redis.get(`hierarchy-general-${userId}`)
        if (!cache) {
            throw new HierarchyNotExists()
        }
        const serializedHierarchy = JSON.parse(cache).data
        const hierarchy = Automerge.load<HierarchyInfoInterface>(serializedHierarchy)
        const newHierarchy = Automerge.change(hierarchy, hierarchy => {
            hierarchy.lastUsedAt = new Date()
        })
        await setAutomergeDocumentAtRedis(CacheService.redis, `hierarchy-general-${userId}`, newHierarchy)
    }

    handleCreateNewDocument (client: Client, info: HierarchyDocumentInfoInterface) {
        const hierarchyUser = client.hierarchyUser as User
        const hierarchy = this.hierarchyMap.get(hierarchyUser.id)
        if (!hierarchy) {
            return
        }
        const newHierarchy = Automerge.change(hierarchy, hierarchy => {
            hierarchy.map[info.id] = info
            const location = info.location.split(',').map(index => Number(index))
            if (location.length === 0) {
                throw new InvalidDocumentLocation()
            }
            const order = location.pop() as number
            const block = hierarchy.list[location.shift() as number]
            const parentBlock = location.reduce((prev, current) => {
                return prev.children[current]
            }, block)
            parentBlock.children.splice(order, 0, {
                id: info.id,
                children: []
            })
        })
        const changes = Automerge.getChanges(hierarchy, newHierarchy)
        const dependencyClients = this.clientsHierarchyDependencyMap.get(hierarchyUser.id)?.values()
        if (!dependencyClients) {
            return
        }
        for (const client of dependencyClients) {
            client.socket.emit('change', new HierarchyChangeEventDTO(changes, 'createDocument'))
        }
    }
}
export default new HierarchyService()
