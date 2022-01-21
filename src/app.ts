import env from './env'
import { OpenSearch, Slack } from '@newturn-develop/molink-utils'
import express from 'express'
import { SocketServer } from './SocketServer'
import cors from 'cors'

OpenSearch.init(env.opensearch.domain, env.opensearch.region)
Slack.init(env.slack.token)

const app = express()
    .use(express.static('build'))
    .use(cors({
        origin: true,
        credentials: true
    }))
    .get('/health-check', (req, res) => res.status(200).end())

const httpServer = app.listen(env.port, () => console.log(`Listening on ${env.port}`))

const socketServer = new SocketServer(httpServer)
socketServer.start()
