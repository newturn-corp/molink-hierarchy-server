import * as Y from 'yjs'
import { SaveBlogDTO, SaveBlogResponseDTO, SetBlogNameDTO, User, AddBlogUserDTO } from '@newturn-develop/types-molink'
import ESBlogRepo from '../Repositories/ESBlogRepo'
import SynchoronizationService from './SynchoronizationService'
import UserBlogAuthorityRepo from '../Repositories/UserBlogAuthorityRepo'
import { UnauthorizedForBlog } from '../Errors/HierarchyError'
import BlogRepo from '../Repositories/BlogRepo'
import LiveBlogRepo from '../Repositories/LiveBlogRepo'
import BlogUserRepo from '../Repositories/BlogUserRepo'

export class BlogService {
    async saveBlog (dto: SaveBlogDTO) {
        const blogName = dto.blogName
        const profileImageURL = null

        const blogID = await BlogRepo.saveBlog(blogName)
        const doc = new Y.Doc()
        doc.getMap('pageInfoMap')
        doc.getArray('topLevelPageIDList')

        const profile = doc.getMap('profile')
        profile.set('name', blogName)
        profile.set('profileImageURL', profileImageURL)

        const setting = doc.getMap('setting')
        setting.set('headerIconActive', false)

        await LiveBlogRepo.persistBlogUpdate(blogID, Y.encodeStateAsUpdate(doc))
        await ESBlogRepo.saveBlog(blogID, blogName, profileImageURL)
        return new SaveBlogResponseDTO(blogID)
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

    async _setBlogName (dto: SetBlogNameDTO) {
        const { blogID, name } = dto
        const blog = await SynchoronizationService.getBlog(blogID)
        const profile = blog.getMap('profile')
        profile.set('name', name)
        await ESBlogRepo.setBlogName(blogID, name)
        if (blog.destoryable) {
            blog.destroy()
        }
    }

    public async addBlogUserInternal (dto: AddBlogUserDTO) {
        return this._addBlogUser(dto)
    }

    private async _addBlogUser (dto: AddBlogUserDTO) {
        await BlogUserRepo.saveBlogUser(dto.blogID, dto.userID, dto.authoritySetProfile, dto.authorityHandleFollow)
    }

    // async setHeaderIconActive (user: User, dto: SetHeaderIconActiveDTO) {
    //     if (user.id !== dto.id) {
    //         throw new UnauthorizedForBlog()
    //     }
    //
    //     const hierarchy = await SynchoronizationService.getBlog(dto.id)
    //     const setting = hierarchy.getMap('setting')
    //     setting.set('headerIconActive', dto.active)
    //     if (hierarchy.destoryable) {
    //         hierarchy.destroy()
    //     }
    // }
}
