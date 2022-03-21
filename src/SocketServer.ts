import { WebSocketServer, WebSocket } from 'ws'
import { v4 as uuidV4 } from 'uuid'
import http, { IncomingMessage } from 'http'
import { Client } from './Client'
import env from './env'
import { parseCookie, Slack } from '@newturn-develop/molink-utils'
import jwt from 'jsonwebtoken'
import { JWTUser } from '@newturn-develop/types-molink'
import UserRepo from './Repositories/UserRepo'
import moment from 'moment-timezone'
import ip from 'ip'

class SocketServer {
    nodeId: string
    httpServer: http.Server | null = null
    server: WebSocketServer | null = null
    clientMap: Map<string, Client> = new Map<string, Client>()

    constructor () {
        this.nodeId = uuidV4()
    }

    start (httpServer: http.Server) {
        this.server = new WebSocketServer({ noServer: true })
        this.httpServer = httpServer
        this.server.on('connection', async (socket, request) => {
            console.log(`${request.headers['x-real-ip']} [${moment().format('YYYY-MM-DD HH:mm:ss')}] upgrade ${request.headers['user-agent']}`)
            await this.handleConnect(socket, request)
        })
        this.httpServer.on('upgrade', (req, socket, head) => {
            console.log(`${req.headers['x-real-ip']} [${moment().format('YYYY-MM-DD HH:mm:ss')}] upgrade ${req.headers['user-agent']}`)
            const id = this.authUser(req)
            if (!id) {
                console.log(`${req.headers['x-real-ip']} [${moment().format('YYYY-MM-DD HH:mm:ss')}] auth fail ${req.headers['user-agent']}`)
                return
            }

            this.server?.handleUpgrade(req, socket, head, (ws) => {
                req.headers.userId = id.toString()
                this.server?.emit('connection', ws, req)
            })
        })
        this.httpServer?.listen(env.port, env.host, () => {
            try {
                const msg = `Hierarchy Server Start\nIP: ${ip.address()}`
                console.log(msg)
                Slack.sendTextMessage(msg, env.isProduction ? 'C033BV5JDDG' : 'C033QHV6HU1')
            } catch (err) {
                console.log(err)
            }
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
            const payload = jwt.verify(token, env.jwt) as JWTUser
            return payload.id
        } catch (e) {
            return false
        }
    }

    async handleConnect (socket: WebSocket, request: http.IncomingMessage) {
        const client = new Client(socket, request)
        await client.init()
        this.clientMap.set(client.id, client)
        const userId = Number(request.headers.userId)
        const user = await UserRepo.getActiveUserById(userId)
        console.log(`${request.headers['x-real-ip']} [${moment().format('YYYY-MM-DD HH:mm:ss')}] ${client.id} connect ${user?.id} ${user?.nickname} ${request.headers['user-agent']}`)
    }
}
export default new SocketServer()
