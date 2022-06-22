import { SetBlogBiographyDTO, SetBlogNameDTO, SetBlogProfileImageDTO, User } from '@newturn-develop/types-molink'
import BlogUserRepo from '../Repositories/BlogUserRepo'
import { UnauthorizedForBlog } from '../Errors/HierarchyError'
import SynchoronizationService from './SynchoronizationService'
import ESBlogRepo from '../Repositories/ESBlogRepo'
import { getUUID, S3Manager } from '@newturn-develop/molink-utils'
import env from '../env'
import BlogRepo from '../Repositories/BlogRepo'
import { ViewerAPI } from '../API/ViewerAPI'

export class BlogProfileService {
    viewerAPI: ViewerAPI

    constructor (viewerAPI: ViewerAPI) {
        this.viewerAPI = viewerAPI
    }

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

    public async setProfileImage (user: User, dto: SetBlogProfileImageDTO) {
        const blogUser = await BlogUserRepo.getBlogUser(dto.blogID, user.id)
        if (!blogUser || !blogUser.authority_set_profile) {
            throw new UnauthorizedForBlog()
        }
        return this._setBlogProfileImage(dto)
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

    public async setBlogBiography (user: User, dto: SetBlogBiographyDTO) {
        const authority = await this.viewerAPI.getBlogAuthority(dto.blogID)
        if (!authority.setProfile) {
            throw new UnauthorizedForBlog()
        }
        return this._setBlogBiography(dto)
    }

    private async _setBlogBiography (dto: SetBlogBiographyDTO) {
        const { blogID, biography } = dto

        const blog = await SynchoronizationService.getBlog(blogID)
        blog.transact(() => {
            const profile = blog.getMap('profile')
            profile.set('biography', biography)
        }, 'server')

        await BlogRepo.setBlogBiography(blogID, biography)
        await ESBlogRepo.setBlogBiography(blogID, biography)

        if (blog.destoryable) {
            blog.destroy()
        }
    }
}
