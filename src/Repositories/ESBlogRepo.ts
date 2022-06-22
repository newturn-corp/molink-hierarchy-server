import { OpenSearch } from '@newturn-develop/molink-utils'

class ESBlogRepo {
    async saveBlog (blogID: number, name: string, profileImageURL: string | null) {
        await OpenSearch.insert(
            'molink-blog',
            'blog', {
                name,
                profileImageURL
            }, blogID.toString()
        )
    }

    async setBlogName (blogID: number, name: string) {
        await OpenSearch.update(
            'molink-blog',
            blogID.toString(), {
                name
            }
        )
    }

    async setBlogBiography (blogID: number, biography: string) {
        await OpenSearch.update(
            'molink-blog',
            blogID.toString(), {
                biography
            }
        )
    }

    async setBlogProfileImageURL (blogID: number, profileImageURL: string | null) {
        await OpenSearch.update(
            'molink-blog',
            blogID.toString(), {
                profileImageURL
            }
        )
    }
}
export default new ESBlogRepo()
