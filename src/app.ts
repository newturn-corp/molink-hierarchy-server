import { OpenSearch, Slack } from '@newturn-develop/molink-utils'
import express from 'express'
import env from './env'
import { SocketServer } from './SocketServer'

OpenSearch.init(env.opensearch.domain, env.opensearch.region)
Slack.init(env.slack.token)

const app = express()
    .use(express.static('build'))
    .get('/health-check', (req, res) => res.status(200).end())

const httpServer = app.listen(env.port, () => console.log(`Listening on ${env.port}`))

const socketServer = new SocketServer(httpServer)
socketServer.start()
