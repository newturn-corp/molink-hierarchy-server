import Automerge from 'automerge'
import { Client } from '../Client'
import { HierarchyChangeTimeout, HierarchyNotExists, InvalidDocumentLocation } from '../Errors/HierarchyError'
import CacheService from './CacheService'
import { HierarchyDocumentInfoInterface, HierarchyInfoInterface, HierarchyChangeEventDTO } from '@newturn-develop/types-molink'
import { getAutomergeDocumentFromRedis, setAutomergeDocumentAtRedis } from '@newturn-develop/molink-utils'
import User from '../Domain/User'
import { v4 as uuidV4 } from 'uuid'

class HierarchyService {
    private hierarchyMap = new Map<number, Automerge.FreezeObject<HierarchyInfoInterface>>()
    private clientsHierarchyDependencyMap = new Map<number, Map<string, Client>>()

    async registerClient (client: Client) {
        const hierarchyUser = client.hierarchyUser as User
        if (hierarchyUser && !this.hierarchyMap.has(hierarchyUser.id)) {
            const hierarchy = await getAutomergeDocumentFromRedis<HierarchyInfoInterface>(CacheService.redis, `hierarchy-general-${hierarchyUser.id}`)
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

    async refreshHierarchyInfoLastUsedAt (userId: number) {
        const hierarchy = await getAutomergeDocumentFromRedis<HierarchyInfoInterface>(CacheService.redis, `hierarchy-general-${userId}`)
        if (!hierarchy) {
            throw new HierarchyNotExists()
        }
        const newHierarchy = Automerge.change(hierarchy, hierarchy => {
            hierarchy.lastUsedAt = new Date()
        })
        await setAutomergeDocumentAtRedis(CacheService.redis, `hierarchy-general-${userId}`, newHierarchy)
    }

    async handleCreateNewDocument (client: Client, info: HierarchyDocumentInfoInterface) {
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
        await this.sendChangeToDependencyClients(client, changes)
    }

    sendChangeToDependencyClients (client: Client, changes: Automerge.BinaryChange[]) {
        return new Promise<void>((resolve, reject) => {
            const changeId = uuidV4()
            const hierarchyUser = client.hierarchyUser as User
            const dependencyClients = this.clientsHierarchyDependencyMap.get(hierarchyUser.id)?.values()
            if (!dependencyClients) {
                return
            }

            let isHandled = false
            client.socket.once(`change-${changeId}-handled`, () => {
                console.log(`client ${client.id}: change ${changeId} handled`)
                isHandled = true
                resolve()
            })
            setTimeout(() => {
                if (isHandled) {
                    return
                }
                console.log(`client ${client.id}: change ${changeId} timeout`)

                isHandled = true
                reject(new HierarchyChangeTimeout())
            }, 5000)
            for (const client of dependencyClients) {
                console.log(`client ${client.id}: send change event`)
                client.socket.emit('change', new HierarchyChangeEventDTO(changeId, changes))
            }
        })
    }
}
export default new HierarchyService()
