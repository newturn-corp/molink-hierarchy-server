import { JsonController, Get, Put, Authorized, CurrentUser, Body, Param, Post } from 'routing-controllers'
import {
    CreatePageInBlogDTO,
    makeResponseMessage
} from '@newturn-develop/types-molink'
import User from '../Domain/User'
import { PageService } from '../Services/PageService'

@JsonController('/pages')
export class PageController {
    @Post('/')
    @Authorized()
    async createPage (@CurrentUser() user: User, @Body() dto: CreatePageInBlogDTO) {
        const service = new PageService()
        const responseDTO = await service.createPage(user.id, dto)
        return makeResponseMessage(201, responseDTO)
    }
}

export default PageController
