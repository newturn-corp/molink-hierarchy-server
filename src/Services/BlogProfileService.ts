import { SetBlogNameDTO, SetBlogProfileImageDTO, User } from '@newturn-develop/types-molink'
import BlogUserRepo from '../Repositories/BlogUserRepo'
import { UnauthorizedForBlog } from '../Errors/HierarchyError'
import SynchoronizationService from './SynchoronizationService'
import ESBlogRepo from '../Repositories/ESBlogRepo'
import { getUUID, S3Manager } from '@newturn-develop/molink-utils'
import env from '../env'
import BlogRepo from '../Repositories/BlogRepo'

export class BlogProfileService {
    public async setBlogName (user: User, dto: SetBlogNameDTO) {
        const blogUser = await BlogUserRepo.getBlogUser(dto.blogID, user.id)
        if (!blogUser || !blogUser.authority_set_profile) {
            throw new UnauthorizedForBlog()
        }
        return this._setBlogName(dto)
    }

    public async setBlogNameInternal (dto: SetBlogNameDTO) {
        return this._setBlogName(dto)
    }

    private async _setBlogName (dto: SetBlogNameDTO) {
        const { blogID, name } = dto

        const blog = await SynchoronizationService.getBlog(blogID)
        blog.transact(() => {
            const profile = blog.getMap('profile')
            profile.set('name', name)
        }, 'server')

        await BlogRepo.setBlogName(blogID, name)
        await ESBlogRepo.setBlogName(blogID, name)

        if (blog.destoryable) {
            blog.destroy()
        }
    }

    public async setBlogProfileImageInternal (dto: SetBlogProfileImageDTO) {
        return this._setBlogProfileImage(dto)
    }

    private async _setBlogProfileImage (dto: SetBlogProfileImageDTO) {
        const { blogID, image } = dto

        const url = await S3Manager.uploadImage(`molink-${env.isProduction ? 'production' : 'development'}-blog-profile-image`, `blog-profile-image-${blogID}-${getUUID()}`, image)

        const blog = await SynchoronizationService.getBlog(blogID)
        blog.transact(() => {
            const profile = blog.getMap('profile')
            profile.set('profileImageURL', url)
        }, 'server')

        await BlogRepo.setBlogProfileImageURL(blogID, url)
        await ESBlogRepo.setBlogProfileImageURL(blogID, url)

        if (blog.destoryable) {
            blog.destroy()
        }
    }
}
