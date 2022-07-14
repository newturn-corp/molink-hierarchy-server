import { BaseRepo } from '@newturn-develop/molink-utils'
import { FollowRequest, BlogFollowRequest } from '@newturn-develop/types-molink'

class BlogFollowRequestRepo extends BaseRepo {
    saveFollowRequest (blogID: number, userID: number) {
        const queryString = 'INSERT INTO BLOG_FOLLOW_REQUEST_TB(blog_id, user_id) VALUES(?, ?)'
        return this._insert(queryString, [blogID, userID])
    }

    checkActiveFollowRequestByBlogIDAndUserID (blogID: number, userID: number): Promise<boolean> {
        const queryString = 'SELECT * FROM BLOG_FOLLOW_REQUEST_TB WHERE blog_id = ? AND user_id = ? AND accepted_at IS NULL AND rejected_at IS NULL'
        return this._check(queryString, [blogID, userID])
    }

    getActiveBlogFollowRequests (blogID: number): Promise<BlogFollowRequest[]> {
        const queryString = 'SELECT * FROM BLOG_FOLLOW_REQUEST_TB WHERE blog_id = ? AND rejected_at IS NULL AND accepted_at IS NULL'
        return this._selectPlural(queryString, [blogID])
    }

    getBlogFollowRequest (id: number): Promise<BlogFollowRequest> {
        const queryString = 'SELECT * FROM BLOG_FOLLOW_REQUEST_TB WHERE id = ?'
        return this._selectSingular(queryString, [id])
    }

    setFollowRequestRejected (id: number) {
        const queryString = 'UPDATE BLOG_FOLLOW_REQUEST_TB SET rejected_at = ? WHERE id = ?'
        return this._update(queryString, [new Date(), id])
    }

    setFollowRequestAccepted (id: number) {
        const queryString = 'UPDATE BLOG_FOLLOW_REQUEST_TB SET accepted_at = ? WHERE id = ?'
        return this._update(queryString, [new Date(), id])
    }

    setActiveFollowRequestsViewedAt (userId: number) {
        const queryString = 'UPDATE BLOG_FOLLOW_REQUEST_TB SET viewed_at = ? WHERE user_id = ? AND rejected_at IS NULL AND accepted_at IS NULL AND viewed_at IS NULL'
        return this._selectPlural(queryString, [new Date(), userId])
    }
}

export default new BlogFollowRequestRepo()
