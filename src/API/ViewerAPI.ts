import axios from 'axios'
import env from '../env'

class ViewerAPI {
    async getPageAuthority (pageId: string) {
        const res = await axios.get(`${env.api.url}/pages/${pageId}/authority`)
        return res.data
    }
}
export default new ViewerAPI()
