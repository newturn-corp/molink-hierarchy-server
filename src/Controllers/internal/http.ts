import { JsonController, Get, Body, Post, Req, Put } from 'routing-controllers'
import {
    makeEmptyResponseMessage,
    SaveBlogInternalDTO,
    CreatePageInBlogInternalDTO,
    makeResponseMessage, SetBlogNameDTO
} from '@newturn-develop/types-molink'
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
    async saveBlog (@Req() req: Request, @Body() dto: SaveBlogInternalDTO) {
        const internalAPIKey = req.cookies['internal-api-key']
        if (!internalAPIKey || internalAPIKey !== env.api.internalKey) {
            throw new CustomHttpError(403, 0, '권한이 없습니다.')
        }
        const service = new BlogService()
        const responseDTO = await service.saveBlog()
        return makeResponseMessage(201, responseDTO)
    }

    @Put('/name')
    async setBlogName (@Req() req: Request, @Body() dto: SetBlogNameDTO) {
        const internalAPIKey = req.cookies['internal-api-key']
        if (!internalAPIKey || internalAPIKey !== env.api.internalKey) {
            throw new CustomHttpError(403, 0, '권한이 없습니다.')
        }
        const service = new BlogService()
        await service.setBlogNameInternal(dto)
        return makeEmptyResponseMessage(200)
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
