import express from 'express'
import http from 'http'
import SocketServer from './SocketServer'
import { useMiddleware } from './Configs/MiddlewareConfig'
import 'reflect-metadata'
import { OpenSearch, Slack } from '@newturn-develop/molink-utils'
import env from './env'
import { startCron } from './cron'

Slack.init(env.slack.token)
OpenSearch.init(env.opensearch.domain, env.opensearch.region)

const app = express()
useMiddleware(app)
const server = http.createServer(app)
SocketServer.start(server)
startCron()
