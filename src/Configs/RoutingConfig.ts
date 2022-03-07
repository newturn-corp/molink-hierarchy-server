import { RoutingControllersOptions } from 'routing-controllers'
import MainController from '../Controllers/http'

import { CustomErrorHandler } from '../Middlewares/CustomErrorHandler'

const routingControllersOptions: RoutingControllersOptions = {
    defaultErrorHandler: false,
    middlewares: [CustomErrorHandler],
    controllers: [
        MainController
    ]
}

export { routingControllersOptions }
