import { RoutingControllersOptions } from 'routing-controllers'
import MainController from '../Controllers/http'

import { CustomErrorHandler } from '../Middlewares/CustomErrorHandler'
import { AuthMiddleware } from '../Middlewares/AuthMiddleware'
import PageController from '../Controllers/pages'
import InternalMainController from '../Controllers/internal/http'
import FollowController from '../Controllers/follow'

const routingControllersOptions: RoutingControllersOptions = {
    defaultErrorHandler: false,
    middlewares: [CustomErrorHandler],
    controllers: [
        MainController,
        PageController,
        InternalMainController,
        FollowController
    ],
    authorizationChecker: AuthMiddleware.authorization,
    currentUserChecker: AuthMiddleware.currentUser
}

export { routingControllersOptions }
