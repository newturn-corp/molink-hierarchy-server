import { JsonController, Get } from 'routing-controllers'
import { makeEmptyResponseMessage } from '@newturn-develop/types-molink'

@JsonController('')
export class MainController {
    @Get('/health-check')
    async checkServerStatus () {
        return makeEmptyResponseMessage(200)
    }
}

export default MainController
