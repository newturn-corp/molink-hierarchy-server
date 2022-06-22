import { JsonController, Authorized, Get, CurrentUser, Body, Put, Post, Param, Req } from 'routing-controllers'
import {
    AcceptFollowRequestDTO, FollowRequestDTO,
    makeEmptyResponseMessage,
    makeResponseMessage,
    RejectFollowRequestDTO, User
} from '@newturn-develop/types-molink'
import { CustomHttpError } from '../Errors/HttpError'
import { AlreadyFollowing, AlreadyFollowRequested, AlreadyHandledRequest } from '../Errors/FollowError'
import { FollowService } from '../Services/FollowService'
import { Request } from 'express'
import { ViewerAPI } from '../API/ViewerAPI'
import { BlogNotExists, UnauthorizedForBlog } from '../Errors/HierarchyError'

@JsonController('/follow')
export class FollowController {
    @Put('/requests/reject')
    @Authorized()
    async rejectFollowRequest (@CurrentUser() user: User, @Body() dto: RejectFollowRequestDTO, @Req() req: Request) {
        try {
            const service = new FollowService(new ViewerAPI(req))
            await service.rejectBlogFollowRequest(user, dto)
            return makeEmptyResponseMessage(200)
        } catch (err) {
            if (err instanceof UnauthorizedForBlog) {
                throw new CustomHttpError(403, 1, '권한이 없습니다.')
            } else if (err instanceof AlreadyHandledRequest) {
                throw new CustomHttpError(409, 1, '이미 처리된 요청입니다.')
            } else {
                throw err
            }
        }
    }

    @Put('/requests/accept')
    @Authorized()
    async acceptFollowRequest (@CurrentUser() user: User, @Body() dto: AcceptFollowRequestDTO, @Req() req: Request) {
        const service = new FollowService(new ViewerAPI(req))
        await service.acceptFollowRequest(user, dto)
        return makeEmptyResponseMessage(200)
    }

    @Post('/')
    @Authorized()
    async follow (@CurrentUser() user: User, @Body() dto: FollowRequestDTO, @Req() req: Request) {
        try {
            const service = new FollowService(new ViewerAPI(req))
            await service.follow(user, dto)
            return makeEmptyResponseMessage(201)
        } catch (err) {
            if (err instanceof BlogNotExists) {
                throw new CustomHttpError(404, 1, '블로그가 존재하지 않습니다.')
            } else if (err instanceof AlreadyFollowing) {
                throw new CustomHttpError(409, 1, '이미 팔로우 중입니다.')
            } else if (err instanceof AlreadyFollowRequested) {
                throw new CustomHttpError(409, 2, '이미 팔로우 요청을 했습니다.')
            } else {
                throw err
            }
        }
    }
}

export default FollowController
