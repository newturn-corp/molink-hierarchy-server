import { JsonController, Get, Put, Authorized, CurrentUser, Body, Param, Post, Req } from 'routing-controllers'
import {
    ChangePageVisibilityDTO,
    CreatePageInBlogDTO, makeEmptyResponseMessage,
    makeResponseMessage, UpdatePageHeaderIconInBlogDTO, UpdatePageTitleInBlogDTO, User
} from '@newturn-develop/types-molink'
import { PageService } from '../Services/PageService'
import PageVisibilityManager from '../Services/PageVisibilityService'
import {
    BlogNotExists,
    ChildrenVisibilityWide,
    PageNotExists,
    ParentVisibilityNarrow,
    UnauthorizedForBlog
} from '../Errors/HierarchyError'
import { CustomHttpError } from '../Errors/HttpError'
import { ViewerAPI } from '../API/ViewerAPI'
import { Request } from 'express'

@JsonController('/pages')
export class PageController {
    @Post('/')
    @Authorized()
    async createPage (@CurrentUser() user: User, @Body() dto: CreatePageInBlogDTO, @Req() req: Request) {
        const service = new PageService(new ViewerAPI(req))
        const responseDTO = await service.createPage(user.id, dto)
        return makeResponseMessage(201, responseDTO)
    }

    @Put('/title')
    @Authorized()
    async updatePageTitle (@CurrentUser() user: User, @Body() dto: UpdatePageTitleInBlogDTO, @Req() req: Request) {
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
    @Authorized()
    async updatePageHeaderIcon (@CurrentUser() user: User, @Body() dto: UpdatePageHeaderIconInBlogDTO, @Req() req: Request) {
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

export default PageController
