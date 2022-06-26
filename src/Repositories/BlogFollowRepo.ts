import { BaseRepo } from '@newturn-develop/molink-utils'
import { Follow } from '@newturn-develop/types-molink'

class BlogFollowRepo extends BaseRepo {
    getUserBlogFollows (userID: number): Promise<Follow[]> {
        const queryString = 'SELECT * FROM BLOG_FOLLOW_TB WHERE user_id = ?'
        return this._selectPlural(queryString, [userID])
    }

    getUserFollowers (userId: number): Promise<Follow[]> {
        const queryString = 'SELECT * FROM BLOG_FOLLOW_TB WHERE user_id = ?'
        return this._selectPlural(queryString, [userId])
    }

    getUserFollowCount (userId: number): Promise<{ count: number }> {
        const queryString = 'SELECT COUNT(*) as count FROM BLOG_FOLLOW_TB WHERE user_id = ?'
        return this._selectSingular(queryString, [userId])
    }

    getUserFollowingCount (userId: number): Promise<{ count: number }> {
        const queryString = 'SELECT COUNT(*) as count FROM BLOG_FOLLOW_TB WHERE following_user_id = ?'
        return this._selectSingular(queryString, [userId])
    }

    saveBlogFollow (blogID: number, userID: number) {
        const queryString = 'INSERT INTO BLOG_FOLLOW_TB(blog_id, user_id) VALUES(?, ?)'
        return this._insert(queryString, [blogID, userID])
    }

    checkFollowByBlogIDAndUserID (userId: number, blogID: number): Promise<Follow[]> {
        const queryString = 'SELECT * FROM BLOG_FOLLOW_TB WHERE user_id = ? AND blog_id = ?'
        return this._check(queryString, [userId, blogID])
    }
}

export default new BlogFollowRepo()
