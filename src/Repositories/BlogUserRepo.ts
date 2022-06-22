import { BaseRepo } from '@newturn-develop/molink-utils'
import { BlogUser } from '@newturn-develop/types-molink'

class BlogUserRepo extends BaseRepo {
    getBlogUser (blogID: number, userID: number): Promise<BlogUser | undefined> {
        const queryString = 'SELECT * FROM BLOG_USER_TB WHERE blog_id = ? AND user_id = ?'
        return this._selectSingular(queryString, [blogID, userID])
    }

    saveBlogUser (blogID: number, userID: number, authoritySetProfile: boolean, authorityHandleFollow: boolean): Promise<BlogUser | undefined> {
        const queryString = 'INSERT INTO BLOG_USER_TB(user_id, blog_id, authority_set_profile, authority_handle_follow) VALUES(?, ?, ?, ?)'
        return this._selectSingular(queryString, [userID, blogID, Number(authoritySetProfile), Number(authorityHandleFollow)])
    }
}

export default new BlogUserRepo()
