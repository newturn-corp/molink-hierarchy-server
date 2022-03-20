import { Slack } from '@newturn-develop/molink-utils'
import env from './env'
import SynchronizationService from './Services/SynchoronizationService'
import schedule from 'node-schedule'

export const startCron = () => {
    schedule.scheduleJob('*/5 * * * *', async () => {
        try {
            const stats = SynchronizationService.getServiceStats()
            await Slack.sendTextMessage(`Hierarchy Server 통계\n현재 문서의 수: ${stats.documentCount}\n전체 유저의 수: ${stats.totalUserCount}\n소켓이 가장 많이 연결된 문서의 ID: ${stats.maxUserID}\n해당 문서에 연결된 소켓의 수: ${stats.maxUserCount}`, env.isProduction ? 'C038JK24FU0' : 'C037N6N5SG6')
        } catch (err) {
            console.log(err)
        }
    })
}
