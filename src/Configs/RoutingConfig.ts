import { RoutingControllersOptions } from 'routing-controllers'
import { CustomErrorHandler } from '../Middlewares/CustomErrorHandler'
import { AuthMiddleware } from '../Middlewares/AuthMiddleware'
import PageController from '../Controllers/pages'
import InternalMainController from '../Controllers/internal/http'
import { FollowController } from '../Controllers/follow'
import { ProfileController } from '../Controllers/profile'
import { MainController } from '../Controllers/http'
import InternalPageController from '../Controllers/internal/pages'

const routingControllersOptions: RoutingControllersOptions = {
    defaultErrorHandler: false,
    middlewares: [CustomErrorHandler],
    controllers: [
        MainController,
        PageController,
        InternalMainController,
        FollowController,
        ProfileController,
        InternalPageController
    ],
    authorizationChecker: AuthMiddleware.authorization,
    currentUserChecker: AuthMiddleware.currentUser
}

export { routingControllersOptions }
