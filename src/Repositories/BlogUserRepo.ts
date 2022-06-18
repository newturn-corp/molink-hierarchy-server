import { BaseRepo } from '@newturn-develop/molink-utils'
import { BlogUser } from '@newturn-develop/types-molink'

class BlogUserRepo extends BaseRepo {
    getBlogUser (blogID: number, userID: number): Promise<BlogUser | undefined> {
        const queryString = 'SELECT * FROM BLOG_USER_TB WHERE blog_id = ? AND user_id = ?'
        return this._selectSingular(queryString, [blogID, userID])
    }
}

export default new BlogUserRepo()
