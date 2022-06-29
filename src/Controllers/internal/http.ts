import {
    JsonController,
    Get,
    Body,
    Post,
    Req,
    Put,
    Authorized,
    UseBefore,
    CurrentUser,
    UploadedFile, Param
} from 'routing-controllers'
import {
    makeEmptyResponseMessage,
    SaveBlogInternalDTO,
    CreatePageInBlogInternalDTO,
    makeResponseMessage, SetBlogNameDTO, AddBlogUserDTO, SaveBlogDTO, User, SetBlogProfileImageDTO
} from '@newturn-develop/types-molink'
import { Request } from 'express'
import env from '../../env'
import { CustomHttpError } from '../../Errors/HttpError'
import { BlogService } from '../../Services/BlogService'
import { PageService } from '../../Services/PageService'
import bodyParser from 'body-parser'
import { BlogProfileService } from '../../Services/BlogProfileService'
import { ViewerAPI } from '../../API/ViewerAPI'

@JsonController('/internal')
export class InternalMainController {
    @Get('/health-check')
    async checkServerStatus () {
        return makeEmptyResponseMessage(200)
    }

    @Post('/')
    async saveBlog (@Req() req: Request, @Body() dto: SaveBlogDTO) {
        const internalAPIKey = req.cookies['internal-api-key']
        if (!internalAPIKey || internalAPIKey !== env.api.internalKey) {
            throw new CustomHttpError(403, 0, '권한이 없습니다.')
        }
        const service = new BlogService()
        const responseDTO = await service.saveBlog(dto)
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

    @Put('/:id/profile-image')
    @UseBefore(bodyParser.urlencoded({ extended: true }))
    // eslint-disable-next-line no-undef
    async setProfileImage (@UploadedFile('image', { required: false }) image: Express.Multer.File, @Param('id') blogIDString: string, @Req() req: Request) {
        const service = new BlogProfileService(new ViewerAPI(req))
        await service.setBlogProfileImageInternal(new SetBlogProfileImageDTO(Number(blogIDString), image as any))
        return makeEmptyResponseMessage(200)
    }

    @Post('/pages')
    async createPage (@Body() dto: CreatePageInBlogInternalDTO, @Req() req: Request) {
        const internalAPIKey = req.cookies['internal-api-key']
        if (!internalAPIKey || internalAPIKey !== env.api.internalKey) {
            throw new CustomHttpError(403, 0, '권한이 없습니다.')
        }
        const service = new PageService(new ViewerAPI(req))
        await service.createPage(dto.userId, dto)
        return makeEmptyResponseMessage(201)
    }

    @Post('/users')
    async addBlogUser (@Body() dto: AddBlogUserDTO, @Req() req: Request) {
        const internalAPIKey = req.cookies['internal-api-key']
        if (!internalAPIKey || internalAPIKey !== env.api.internalKey) {
            throw new CustomHttpError(403, 0, '권한이 없습니다.')
        }
        const service = new BlogService()
        await service.addBlogUserInternal(dto)
        return makeEmptyResponseMessage(201)
    }
}

export default InternalMainController
