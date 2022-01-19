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
        console.log(socket.nsp.name.slice(1, socket.nsp.name.length))
    }

    async init () {
        console.log('client init')
        await this.authorizeUser()
        if (!this.user) {
            return this.socket.leave(this.id)
        }
        this.mainController = new MainController(this.user?.id as number, this)
        await HierarchyService.registerClient(this)
    }

    async setHierarchyUser () {
        const hierarchyUser = await UserRepo.getActiveUserByNickname(this.socket.nsp.name.slice(1, this.socket.nsp.name.length))
        this.hierarchyUser = hierarchyUser
        console.log(this.hierarchyUser)
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
