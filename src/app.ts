import express from 'express'
import http from 'http'
import SocketServer from './SocketServer'
import { useMiddleware } from './Configs/MiddlewareConfig'
import 'reflect-metadata'

const app = express()
useMiddleware(app)
const server = http.createServer(app)
SocketServer.start(server)
