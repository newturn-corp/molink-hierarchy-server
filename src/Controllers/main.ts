import { Client } from '../Client'
import * as encoding from 'lib0/encoding'
import * as decoding from 'lib0/decoding'
import { MessageType } from '../Enum'
import { Data as WSData } from 'ws'
import * as awarenessProtocol from 'y-protocols/awareness'
import * as syncProtocol from 'y-protocols/sync'
import CacheService from '../Services/CacheService'
import { SharedDocument } from '../Domain/SharedDocument'
import moment from 'moment-timezone'

export class MainController {
    client: Client

    constructor (client: Client) {
        this.client = client
        this.client.socket.on('message', (message: WSData) => {
            console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${client.id} message ${this.client.blogID}`)
            this.handleMessage(new Uint8Array(message as ArrayBuffer))
        })

        this.client.socket.on('close', () => {
            console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${client.id} close ${this.client.blogID}`)
            this.client.document?.closeWebSocket(this.client.socket)
            if (this.client.pingInterval) {
                clearInterval(this.client.pingInterval)
            }
        })

        this.client.socket.on('pong', () => {
            this.client.pongReceived = true
        })
    }

    handleMessage (message: Uint8Array) {
        const encoder = encoding.createEncoder()
        const decoder = decoding.createDecoder(message)
        const messageType = decoding.readVarUint(decoder) as MessageType
        const document = this.client.document as SharedDocument
        switch (messageType) {
        case MessageType.MessageSync: {
            console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${this.client.id} send sync message ${this.client.blogID}`)
            encoding.writeVarUint(encoder, MessageType.MessageSync)
            syncProtocol.readSyncMessage(decoder, encoder, document, this.client.socket)

            if (encoding.length(encoder) > 1) {
                document.send(this.client.socket, encoding.toUint8Array(encoder))
            }
            break
        }
        case MessageType.MessageAwareness: {
            console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${this.client.id} send awareness message ${this.client.blogID}`)
            const update = decoding.readVarUint8Array(decoder)
            CacheService.publisher.publishBuffer(document.awarenessChannel, Buffer.from(update))
            awarenessProtocol.applyAwarenessUpdate(document.awareness, update, this.client.socket)
            break
        }
        default: throw new Error('unreachable')
        }
    }
}
