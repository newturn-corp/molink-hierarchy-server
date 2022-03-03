import express from 'express'
import moment from 'moment-timezone'
import morgan from 'morgan'
import userAgent from 'express-useragent'
import { useExpressServer } from 'routing-controllers'
import { routingControllersOptions } from './RoutingConfig'

export function useMiddleware (app: express.Application) {
    morgan.token('date', () => {
        return moment().format('YYYY-MM-DD HH:mm:ss')
    })
    const logFormat = ':remote-addr [:date[clf]] ":method :url" :status :res[content-length] - :response-time ms ":user-agent"'
    app.use(morgan(logFormat))
    app.use(userAgent.express())
    useExpressServer(app, routingControllersOptions)
}
