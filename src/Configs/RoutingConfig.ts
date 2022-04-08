import { RoutingControllersOptions } from 'routing-controllers'
import MainController from '../Controllers/http'

import { CustomErrorHandler } from '../Middlewares/CustomErrorHandler'
import { AuthMiddleware } from '../Middlewares/AuthMiddleware'

const routingControllersOptions: RoutingControllersOptions = {
    defaultErrorHandler: false,
    middlewares: [CustomErrorHandler],
    controllers: [
        MainController
    ],
    authorizationChecker: AuthMiddleware.authorization,
    currentUserChecker: AuthMiddleware.currentUser
}

export { routingControllersOptions }
