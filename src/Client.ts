import { randomUUID } from 'crypto'
import http from 'http'
import { WebSocket } from 'ws'
import SynchronizationService from './Services/SynchoronizationService'
import * as encoding from 'lib0/encoding'
import * as awarenessProtocol from 'y-protocols/awareness'
import * as syncProtocol from 'y-protocols/sync'
import { SharedDocument } from './Domain/SharedDocument'
import { MainController } from './Controllers/main'

export class Client {
    id: string = ''
    socket: WebSocket
    document: SharedDocument | undefined
    blogID: number
    pongReceived = true
    pingInterval: NodeJS.Timer | undefined
    controller: MainController | undefined

    constructor (socket: WebSocket, request: http.IncomingMessage) {
        this.id = randomUUID()
        this.socket = socket
        this.socket.binaryType = 'arraybuffer'
        this.blogID = Number(request.url?.slice(1).split('?')[0])
    }

    async init () {
        this.document = await SynchronizationService.getBlog(this.blogID)
        this.document.socketMap.set(this.socket, new Set())
        this.controller = new MainController(this)

        this.pingInterval = setInterval(() => {
            if (!this.pongReceived) {
                if (this.document?.socketMap.has(this.socket)) {
                    this.document.closeWebSocket(this.socket)
                }
                if (this.pingInterval) {
                    clearInterval(this.pingInterval)
                }
            } else if (this.document?.socketMap.has(this.socket)) {
                this.pongReceived = false
                try {
                    this.socket.ping()
                } catch (e) {
                    this.document.closeWebSocket(this.socket)
                    if (this.pingInterval) {
                        clearInterval(this.pingInterval)
                    }
                }
            }
        }, 30000)
        {
            // send sync step 1
            const encoder = encoding.createEncoder()
            const messageSync = 0
            const messageAwareness = 1
            encoding.writeVarUint(encoder, messageSync)
            syncProtocol.writeSyncStep1(encoder, this.document)
            this.document.send(this.socket, encoding.toUint8Array(encoder))
            const awarenessStates = this.document.awareness.getStates()
            if (awarenessStates.size > 0) {
                const encoder = encoding.createEncoder()
                encoding.writeVarUint(encoder, messageAwareness)
                encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(this.document.awareness, Array.from(awarenessStates.keys())))
                this.document.send(this.socket, encoding.toUint8Array(encoder))
            }
        }
    }
}
