import { Socket } from 'socket.io'
import cookieParser from 'cookie'
import jsonWebToken from 'jsonwebtoken'
import User from './Domain/User'
import HierarchyService from './Services/HierarchyService'
import UserRepo from './Repositories/UserRepo'
import env from './env'
import { MainController } from './Controllers/main'
import { JWTUser } from '@newturn-develop/types-molink'

export class Client {
    id: string = ''
    user: User | undefined
    socket: Socket
    mainController: MainController | undefined
    hierarchyUser: User | undefined

    constructor (socket: Socket) {
        this.socket = socket
        this.id = socket.id
    }

    async init () {
        console.log(`client connected. socketId: ${this.id}`)

        await this.authorizeUser()
        if (!this.user) {
            console.log(`socket ${this.id} close. Reason: Unauthorized`)
            return this.socket.leave(this.id)
        }

        await this.setHierarchyUser()
        if (!this.hierarchyUser) {
            console.log(`socket ${this.id} close. Reason: No HierarchyUser`)
            return this.socket.leave(this.id)
        }

        console.log(`user ${this.user.id} connected hierarchy name: ${this.hierarchyUser.nickname}, id: ${this.hierarchyUser.id}`)

        this.mainController = new MainController(this.user.id, this)
        await HierarchyService.registerClient(this)
    }

    async setHierarchyUser () {
        const hierarchyUser = await UserRepo.getActiveUserByNickname(this.socket.nsp.name.slice(1, this.socket.nsp.name.length))
        this.hierarchyUser = hierarchyUser
    }

    async authorizeUser () {
        const { cookie } = this.socket.handshake.headers
        if (!cookie) {
            return
        }
        const { token } = cookieParser.parse(cookie)
        if (!token) {
            return
        }
        try {
            const decoded = jsonWebToken.verify(token, env.jwt) as JWTUser
            if (!decoded.id) {
                return
            }
            this.user = await UserRepo.getActiveUserById(decoded.id)
        } catch (e) {

        }
    }
}
