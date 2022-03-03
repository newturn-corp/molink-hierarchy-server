import { WebSocketServer, WebSocket } from 'ws'
import { v4 as uuidV4 } from 'uuid'
import http, { IncomingMessage } from 'http'
import { Client } from './Client'
import env from './env'
import { parseCookie } from '@newturn-develop/molink-utils'
import jwt from 'jsonwebtoken'

export class SocketServer {
    nodeId: string
    httpServer: http.Server
    server: WebSocketServer

    constructor (httpServer: http.Server) {
        this.nodeId = uuidV4()
        this.server = new WebSocketServer({ noServer: true })
        this.httpServer = httpServer
    }

    start () {
        this.server.on('connection', async (socket, request) => {
            await this.handleConnect(socket, request)
            // await setupWSConnection(ws, req);
        })
        this.httpServer.on('upgrade', (req, socket, head) => {
            if (!this.authUser(req)) {
                return
            }

            this.server.handleUpgrade(req, socket, head, (ws) => {
                this.server.emit('connection', ws, req)
            })
        })
        this.httpServer.listen(env.port, env.host, () => {
            console.log(`molink-content server start at ${env.port}`)
        })
    }

    authUser (req: IncomingMessage) {
        const { cookie } = req.headers
        if (!cookie) {
            return false
        }
        const { token } = parseCookie(cookie)
        if (!token) {
            return false
        }
        try {
            jwt.verify(token, env.jwt)
            return true
        } catch (e) {
            return false
        }
    }

    async handleConnect (socket: WebSocket, request: http.IncomingMessage) {
        const client = new Client(socket, request)
        await client.init()
        console.log(client.id + ' connected')
    }
}
