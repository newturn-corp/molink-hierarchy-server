import { JsonController, Authorized, Get, CurrentUser, Put, Param, Req, Post } from 'routing-controllers'
import {
    makeEmptyResponseMessage,
    makeResponseMessage, User
} from '@newturn-develop/types-molink'
import { NotificationService } from '../Services/NotificationService'
import { Request } from 'express'
import { ViewerAPI } from '../API/ViewerAPI'
import { UnauthorizedForBlog } from '../Errors/HierarchyError'
import { CustomHttpError } from '../Errors/HttpError'

@JsonController('/notifications')
export class NotificationController {
    @Get('/:blogID')
    @Authorized()
    async getNotifications (@CurrentUser() user: User, @Param('blogID') blogIDString: string, @Req() req: Request) {
        try {
            const service = new NotificationService(new ViewerAPI(req))
            const arr = await service.getActiveBlogNotifications(user, Number(blogIDString))
            return makeResponseMessage(200, arr)
        } catch (err) {
            if (err instanceof UnauthorizedForBlog) {
                throw new CustomHttpError(403, 0, '권한이 없습니다.')
            } else {
                throw err
            }
        }
    }

    @Put('/:blogID/viewed-at')
    @Authorized()
    async setNotificationsViewedAt (@CurrentUser() user: User, @Param('blogID') blogIDString: string, @Req() req: Request) {
        try {
            const service = new NotificationService(new ViewerAPI(req))
            await service.setNotificationsViewedAt(user, Number(blogIDString))
            return makeEmptyResponseMessage(200)
        } catch (err) {
            if (err instanceof UnauthorizedForBlog) {
                throw new CustomHttpError(403, 0, '권한이 없습니다.')
            } else {
                throw err
            }
        }
    }

    @Put('/:blogID/checked-at')
    @Authorized()
    async setNotificationsCheckedAt (@CurrentUser() user: User, @Param('blogID') blogIDString: string, @Req() req: Request) {
        try {
            const service = new NotificationService(new ViewerAPI(req))
            await service.setNotificationsCheckedAt(user, Number(blogIDString))
            return makeEmptyResponseMessage(200)
        } catch (err) {
            if (err instanceof UnauthorizedForBlog) {
                throw new CustomHttpError(403, 0, '권한이 없습니다.')
            } else {
                throw err
            }
        }
    }
}

export default NotificationController
