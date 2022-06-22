import { BaseRepo } from '@newturn-develop/molink-utils'
import { Blog, User } from '@newturn-develop/types-molink'

class BlogRepo extends BaseRepo {
    getActiveBlog (id: number): Promise<Blog | undefined> {
        const queryString = 'SELECT * FROM BLOG_TB WHERE id = ? AND is_deleted = 0'
        return this._selectSingular(queryString, [id])
    }

    saveBlog (name: string): Promise<number> {
        const queryString = 'INSERT INTO BLOG_TB(blog_name) VALUES(?)'
        return this._insert(queryString, [name])
    }

    setBlogName (id: number, name: string) {
        const queryString = 'UPDATE BLOG_TB SET blog_name = ? WHERE id = ?'
        return this._update(queryString, [name, id])
    }

    setBlogProfileImageURL (id: number, profileImageURL: string) {
        const queryString = 'UPDATE BLOG_TB SET profile_image_url = ? WHERE id = ?'
        return this._update(queryString, [profileImageURL, id])
    }
}

export default new BlogRepo()
