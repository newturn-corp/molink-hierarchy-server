import { Server, Socket } from 'socket.io'
import { v4 as uuidV4 } from 'uuid'
import http from 'http'
import { Client } from './Client'
import NamespaceMiddleware from './Middlewares/NamespaceMiddleware'

export class SocketServer {
    nodeId: string
    server: Server

    constructor (httpServer: http.Server) {
        this.nodeId = uuidV4()
        this.server = new Server(httpServer, {
            transports: ['websocket'],
            cors: {
                credentials: true
            }
        })
    }

    start () {
        console.log('socket server start')
        this.server
            .of(NamespaceMiddleware)
            .on('connect', (socket) => this.handleConnect(socket))
    }

    async handleConnect (socket: Socket) {
        const client = new Client(socket)
        client.init()
    }
}
