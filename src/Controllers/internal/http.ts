import { JsonController, Get, Body, Post, Req } from 'routing-controllers'
import { makeEmptyResponseMessage, SaveBlogInternalDTO, CreatePageInBlogInternalDTO } from '@newturn-develop/types-molink'
import { Request } from 'express'
import env from '../../env'
import { CustomHttpError } from '../../Errors/HttpError'
import { BlogService } from '../../Services/BlogService'
import { PageService } from '../../Services/PageService'

@JsonController('/internal')
export class InternalMainController {
    @Get('/health-check')
    async checkServerStatus () {
        return makeEmptyResponseMessage(200)
    }

    @Post('/')
    async saveBlog (@Body() dto: SaveBlogInternalDTO, @Req() req: Request) {
        const internalAPIKey = req.cookies['internal-api-key']
        if (!internalAPIKey || internalAPIKey !== env.api.internalKey) {
            throw new CustomHttpError(403, 0, '권한이 없습니다.')
        }
        const service = new BlogService()
        await service.saveBlog(dto)
        return makeEmptyResponseMessage(201)
    }

    @Post('/pages')
    async createPage (@Body() dto: CreatePageInBlogInternalDTO, @Req() req: Request) {
        const internalAPIKey = req.cookies['internal-api-key']
        if (!internalAPIKey || internalAPIKey !== env.api.internalKey) {
            throw new CustomHttpError(403, 0, '권한이 없습니다.')
        }
        const service = new PageService()
        await service.createPage(dto.userId, dto)
        return makeEmptyResponseMessage(201)
    }
}

export default InternalMainController
