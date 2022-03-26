import express from 'express'
import moment from 'moment-timezone'
import morgan from 'morgan'
import userAgent from 'express-useragent'
import { useExpressServer } from 'routing-controllers'
import { routingControllersOptions } from './RoutingConfig'
import env from '../env'
import cors from 'cors'
import cookieParser from 'cookie-parser'

export function useMiddleware (app: express.Application) {
    app.set('port', env.port || 8000)
    app.use(
        cors({
            preflightContinue: true,
            origin: env.allow_origin_list.split(','),
            credentials: true
        })
    )
    morgan.token('date', () => {
        return moment().format('YYYY-MM-DD HH:mm:ss')
    })
    const logFormat = ':req[X-Real-IP] [:date[clf]] ":method :url" :status :res[content-length] - :response-time ms ":user-agent"'
    app.use(cookieParser(env.secret.cookie))
    app.use(morgan(logFormat))
    app.use(userAgent.express())
    useExpressServer(app, routingControllersOptions)
}
