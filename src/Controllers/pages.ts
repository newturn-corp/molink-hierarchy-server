import { JsonController, Get, Put, Authorized, CurrentUser, Body, Param, Post, Req } from 'routing-controllers'
import {
    CreatePageInBlogDTO,
    makeResponseMessage, User
} from '@newturn-develop/types-molink'
import { PageService } from '../Services/PageService'
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
}

export default PageController
