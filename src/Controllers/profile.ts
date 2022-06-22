import {
    JsonController,
    Get,
    Put,
    Authorized,
    CurrentUser,
    Body,
    Param,
    Req,
    UseBefore,
    UploadedFile
} from 'routing-controllers'
import {
    makeEmptyResponseMessage, SetBlogBiographyDTO, SetBlogProfileImageDTO,
    User
} from '@newturn-develop/types-molink'
import {
    UnauthorizedForBlog
} from '../Errors/HierarchyError'
import { CustomHttpError } from '../Errors/HttpError'
import { BlogProfileService } from '../Services/BlogProfileService'
import { ViewerAPI } from '../API/ViewerAPI'
import { Request } from 'express'
import bodyParser from 'body-parser'

@JsonController('/profile')
export class ProfileController {
    @Put('/biography')
    @Authorized()
    async setBlogBiography (@CurrentUser() user: User, @Body() dto: SetBlogBiographyDTO, @Req() req: Request) {
        try {
            const service = new BlogProfileService(new ViewerAPI(req))
            await service.setBlogBiography(user, dto)
            return makeEmptyResponseMessage(200)
        } catch (err) {
            if (err instanceof UnauthorizedForBlog) {
                throw new CustomHttpError(403, 1, '권한이 없습니다.')
            } else {
                throw err
            }
        }
    }

    @Put('/profile-image')
    @Authorized()
    @UseBefore(bodyParser.urlencoded({ extended: true }))
    // eslint-disable-next-line no-undef
    async setProfileImage (@CurrentUser() user: User, @UploadedFile('image', { required: false }) image: Express.Multer.File, @Body() dto: SetBlogProfileImageDTO, @Req() req: Request) {
        const service = new BlogProfileService(new ViewerAPI(req))
        await service.setProfileImage(user, new SetBlogProfileImageDTO(dto.blogID, image as any))
        return makeEmptyResponseMessage(200)
    }
}
