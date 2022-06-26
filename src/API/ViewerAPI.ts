import axios from 'axios'
import env from '../env'
import { BlogAuthority, GetBlogAuthorityResponseDTO } from '@newturn-develop/types-molink'

export class ViewerAPI {
    clientRequest: any

    constructor (request: any) {
        this.clientRequest = request
    }

    async getBlogAuthority (blogID: number): Promise<BlogAuthority> {
        const config = this.clientRequest.cookies.token
            ? {
                headers: {
                    Cookie: `token=${this.clientRequest.cookies.token}`
                }
            }
            : undefined
        const res = await axios.get(`${env.api.url}/viewer/blog/${blogID}/authority`, config)
        return res.data.data
    }
}
