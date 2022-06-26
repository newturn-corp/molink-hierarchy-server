import { JsonController, Get, Put, Authorized, CurrentUser, Body, Param, Req } from 'routing-controllers'
import {
    ChangePageVisibilityDTO,
    makeEmptyResponseMessage, User
} from '@newturn-develop/types-molink'
import PageVisibilityManager from '../Services/PageVisibilityService'
import {
    ChildrenVisibilityWide,
    PageNotExists,
    ParentVisibilityNarrow
} from '../Errors/HierarchyError'
import { CustomHttpError } from '../Errors/HttpError'

@JsonController('')
export class MainController {
    @Get('/health-check')
    async checkServerStatus () {
        return makeEmptyResponseMessage(200)
    }

    @Put('/visibility')
    @Authorized()
    async changePageVisibility (@CurrentUser() user: User, @Body() dto: ChangePageVisibilityDTO) {
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

    // @Put('/header-icon-active')
    // @Authorized()
    // async setHeaderIconActive (@CurrentUser() user: User, @Body() dto: SetHeaderIconActiveDTO) {
    //     try {
    //         const service = new BlogService()
    //         await service.setHeaderIconActive(user, dto)
    //         return makeEmptyResponseMessage(200)
    //     } catch (err) {
    //         if (err instanceof BlogNotExists) {
    //             throw new CustomHttpError(404, 0, '블로그가 존재하지 않습니다.')
    //         } else if (err instanceof UnauthorizedForBlog) {
    //             throw new CustomHttpError(403, 0, '블로그에 대한 권한이 없습니다.')
    //         } else {
    //             throw err
    //         }
    //     }
    // }
}
