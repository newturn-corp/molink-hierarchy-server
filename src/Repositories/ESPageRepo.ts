import { OpenSearch, pageVisibilityToNumber } from '@newturn-develop/molink-utils'
import { PageVisibility } from '@newturn-develop/types-molink'

class ESUserRepo {
    async setPagesVisibility (pageIDList: string[], visibility: PageVisibility) {
        await OpenSearch.updateByQueryWithScript('molink-page', {
            ids: {
                values: pageIDList
            }
        }, `ctx._source.visibility = ${pageVisibilityToNumber(visibility)}`)
    }
}
export default new ESUserRepo()
