import * as Y from 'yjs'
import * as mutex from 'lib0/mutex'
import * as encoding from 'lib0/encoding'
import * as awarenessProtocol from 'y-protocols/awareness'
import * as syncProtocol from 'y-protocols/sync'
import { WebSocket } from 'ws'
import SynchronizationService from '../Services/SynchoronizationService'
import CacheService from '../Services/CacheService'
import { MessageType } from '../Enum'
import HierarchyRepo from '../Repositories/HierarchyRepo'

export class SharedDocument extends Y.Doc {
    id: number;
    awarenessChannel: string;
    mux: mutex.mutex;
    socketMap: Map<WebSocket, Set<number>>;
    awareness: awarenessProtocol.Awareness;

    constructor (id: number) {
        super()
        this.id = id
        this.awarenessChannel = `${id}-awareness`
        this.mux = mutex.createMutex()
        this.socketMap = new Map()
        this.awareness = new awarenessProtocol.Awareness(this)

        this.awareness.on('update', ({ added, updated, removed }: { added: number[], updated: number[], removed: number[] }, origin: any) => this.handleAwarenessChange({ added, updated, removed }, origin))
        this.on('update', (update: Uint8Array, origin: any, doc: SharedDocument) => this.handleUpdate(update, origin, doc))

        CacheService.subscriber.subscribe([this.id, this.awarenessChannel]).then(() => {
            CacheService.subscriber.on('messageBuffer', (channel: any, update: any) => {
                const channelId = channel.toString()

                // update is a Buffer, Buffer is a subclass of Uint8Array, update can be applied
                // as an update directly

                if (channelId === this.id) {
                    Y.applyUpdate(this, update, CacheService.subscriber)
                } else if (channelId === this.awarenessChannel) {
                    awarenessProtocol.applyAwarenessUpdate(this.awareness, update, CacheService.subscriber)
                }
            })
        })
    }

    get destoryable () {
        return this.socketMap.size === 0
    }

    private async handleUpdate (update: Uint8Array, origin: any, document: SharedDocument) {
        let shouldPersist = false

        // 웹소켓에서 온 update이면서 socketMap에 저장되어 있으면 persist
        if (origin instanceof WebSocket && document.socketMap.has(origin)) {
            CacheService.publisher.publishBuffer(document.id, Buffer.from(update)) // do not await
            shouldPersist = true
        }

        const encoder = encoding.createEncoder()
        encoding.writeVarUint(encoder, MessageType.MessageSync)
        syncProtocol.writeUpdate(encoder, update)
        const message = encoding.toUint8Array(encoder)
        document.socketMap.forEach((_, socket) => {
            this.send(socket, message)
        })

        if (shouldPersist) {
            await HierarchyRepo.persistHierarchyUpdate(this.id, update)
        }
    }

    handleAwarenessChange ({ added, updated, removed }: { added: number[], updated: number[], removed: number[] }, origin: any) {
        const changedClients = added.concat(updated, removed)
        const connControlledIds = this.socketMap.get(origin)
        if (connControlledIds) {
            added.forEach(clientId => { connControlledIds.add(clientId) })
            removed.forEach(clientId => { connControlledIds.delete(clientId) })
        }

        const encoder = encoding.createEncoder()
        encoding.writeVarUint(encoder, MessageType.MessageAwareness)
        encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients))
        const buff = encoding.toUint8Array(encoder)

        this.socketMap.forEach((_, socket) => {
            this.send(socket, buff)
        })
    }

    public send (socket: WebSocket, message: Uint8Array) {
        const wsReadyStateConnecting = 0
        const wsReadyStateOpen = 1
        if (socket.readyState !== wsReadyStateConnecting && socket.readyState !== wsReadyStateOpen) {
            this.closeWebSocket(socket)
        }

        try {
            socket.send(message, err => {
                if (err) {
                    this.closeWebSocket(socket)
                }
            })
        } catch (e) {
            this.closeWebSocket(socket)
        }
    }

    public closeWebSocket (socket: WebSocket) {
        const controlledIds = this.socketMap.get(socket)
        if (controlledIds) {
            this.socketMap.delete(socket)
            awarenessProtocol.removeAwarenessStates(this.awareness, Array.from(controlledIds), null)

            if (this.destoryable) {
                this.destroy()
            }
        }

        socket.close()
    }

    destroy () {
        super.destroy()
        SynchronizationService.deleteHierarchy(this.id)
        CacheService.subscriber.unsubscribe(this.id)
    }
}
