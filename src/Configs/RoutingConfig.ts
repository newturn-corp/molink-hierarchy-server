import { RoutingControllersOptions } from 'routing-controllers'
import MainController from '../Controllers/http'

import { CustomErrorHandler } from '../Middlewares/CustomErrorHandler'
import { AuthMiddleware } from '../Middlewares/AuthMiddleware'
import PageController from '../Controllers/pages'
import InternalMainController from '../Controllers/internal/http'
import FollowController from '../Controllers/follow'
import ProfileController from '../Controllers/profile'

const routingControllersOptions: RoutingControllersOptions = {
    defaultErrorHandler: false,
    middlewares: [CustomErrorHandler],
    controllers: [
        MainController,
        PageController,
        InternalMainController,
        FollowController,
        ProfileController
    ],
    authorizationChecker: AuthMiddleware.authorization,
    currentUserChecker: AuthMiddleware.currentUser
}

export { routingControllersOptions }
