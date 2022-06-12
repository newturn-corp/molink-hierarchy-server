import { JsonController, Get, Put, Authorized, CurrentUser, Body, Param, Post } from 'routing-controllers'
import {
    ChangePageVisibilityDTO,
    CreatePageInBlogDTO, makeEmptyResponseMessage,
    makeResponseMessage
} from '@newturn-develop/types-molink'
import User from '../Domain/User'
import { PageService } from '../Services/PageService'
import PageVisibilityManager from '../Services/PageVisibilityService'
import { ChildrenVisibilityWide, PageNotExists, ParentVisibilityNarrow } from '../Errors/HierarchyError'
import { CustomHttpError } from '../Errors/HttpError'

@JsonController('/pages')
export class PageController {
    @Post('/')
    @Authorized()
    async createPage (@CurrentUser() user: User, @Body() dto: CreatePageInBlogDTO) {
        const service = new PageService()
        const responseDTO = await service.createPage(user.id, dto)
        return makeResponseMessage(201, responseDTO)
    }

    @Put('/title')
    @Authorized()
    async setPageTitle (@CurrentUser() user: User, @Body() dto: ChangePageVisibilityDTO) {
        try {
            await PageVisibilityManager.changePageVisibility(user, dto)
            return makeEmptyResponseMessage(200)
        } catch (err) {
            if (err instanceof PageNotExists) {
                throw new CustomHttpError(404, 0, '페이지가 존재하지 않습니다.')
            } else if (err instanceof ParentVisibilityNarrow) {
                throw new CustomHttpError(409, 0, '부모의 공개 범위가 바꾸려는 문서보다 좁습니다.')
            } else if (err instanceof ChildrenVisibilityWide) {
                throw new CustomHttpError(409, 1, '자식의 공개 범위가 바꾸려는 문서보다 넓습니다.')
            } else {
                throw err
            }
        }
    }
}

export default PageController
