import express from 'express'
import http from 'http'
import { SocketServer } from './SocketServer'

const app = express()
    .get('/health-check', (req, res) => res.status(200).end())
const server = http.createServer(app)
const socketServer = new SocketServer(server)
socketServer.start()
