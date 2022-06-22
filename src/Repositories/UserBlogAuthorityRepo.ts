import { BaseRepo } from '@newturn-develop/molink-utils'
import { UserBlogAuthority } from '@newturn-develop/types-molink'

class UserBlogAuthorityRepo extends BaseRepo {
    getUserBlogAuthority (userID: number, blogID: string): Promise<UserBlogAuthority | undefined> {
        const queryString = 'SELECT * FROM USER_BLOG_AUTHORITY_TB WHERE user_id = ? AND blog_id = ?'
        return this._selectSingular(queryString, [userID, blogID])
    }

    saveUserBlogAuthority (userID: number, blogID: string, viewable: boolean, editable: boolean): Promise<number> {
        const queryString = 'INSERT INTO USER_BLOG_AUTHORITY_TB(user_id, blog_id, viewable, editable) VALUES(?, ?, ?, ?)'
        return this._selectSingular(queryString, [userID, blogID, Number(viewable), Number(editable)])
    }
}

export default new UserBlogAuthorityRepo()
