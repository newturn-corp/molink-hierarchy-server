import { JsonController, Put, Authorized, CurrentUser, Body, Req } from 'routing-controllers'
import {
    makeEmptyResponseMessage,
    UpdatePageHeaderIconInBlogDTO, UpdatePageTitleInBlogDTO, User
} from '@newturn-develop/types-molink'
import { PageService } from '../../Services/PageService'
import {
    BlogNotExists,
    PageNotExists,
    UnauthorizedForBlog
} from '../../Errors/HierarchyError'
import { CustomHttpError } from '../../Errors/HttpError'
import { ViewerAPI } from '../../API/ViewerAPI'
import { Request } from 'express'
import env from '../../env'

@JsonController('/internal/pages')
export class InternalPageController {
    @Put('/title')
    async updatePageTitle (@CurrentUser() user: User, @Body() dto: UpdatePageTitleInBlogDTO, @Req() req: Request) {
        const internalAPIKey = req.cookies['internal-api-key']
        if (!internalAPIKey || internalAPIKey !== env.api.internalKey) {
            throw new CustomHttpError(403, 0, '권한이 없습니다.')
        }
        try {
            const service = new PageService(new ViewerAPI(req))
            await service.updatePageTitle(dto)
            return makeEmptyResponseMessage(200)
        } catch (err) {
            if (err instanceof UnauthorizedForBlog) {
                throw new CustomHttpError(403, 1, '권한이 없습니다.')
            } else if (err instanceof PageNotExists) {
                throw new CustomHttpError(404, 1, '페이지가 존재하지 않습니다.')
            } else if (err instanceof BlogNotExists) {
                throw new CustomHttpError(404, 2, '블로그가 존재하지 않습니다.')
            } else {
                throw err
            }
        }
    }

    @Put('/icon')
    async updatePageHeaderIcon (@CurrentUser() user: User, @Body() dto: UpdatePageHeaderIconInBlogDTO, @Req() req: Request) {
        const internalAPIKey = req.cookies['internal-api-key']
        if (!internalAPIKey || internalAPIKey !== env.api.internalKey) {
            throw new CustomHttpError(403, 0, '권한이 없습니다.')
        }
        try {
            const service = new PageService(new ViewerAPI(req))
            await service.updatePageHeaderIcon(dto)
            return makeEmptyResponseMessage(200)
        } catch (err) {
            if (err instanceof UnauthorizedForBlog) {
                throw new CustomHttpError(403, 1, '권한이 없습니다.')
            } else if (err instanceof PageNotExists) {
                throw new CustomHttpError(404, 1, '페이지가 존재하지 않습니다.')
            } else if (err instanceof BlogNotExists) {
                throw new CustomHttpError(404, 2, '블로그가 존재하지 않습니다.')
            } else {
                throw err
            }
        }
    }
}

export default InternalPageController
