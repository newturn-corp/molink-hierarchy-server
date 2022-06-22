import { BaseRepo } from '@newturn-develop/molink-utils'
import { Notification, NotificationType } from '@newturn-develop/types-molink'

class NotificationRepo extends BaseRepo {
    public saveNotification (userId: number, notificationType: NotificationType, notificationContent: string, causedUserId: number, additionalInfo: string) {
        const queryString = 'INSERT INTO NOTIFICATION_TB(user_id, notification_type, notification_content, caused_user_id, additional_info) VALUES(?, ?, ?, ?, ?)'
        return this._insert(queryString, [userId, notificationType, notificationContent, causedUserId, additionalInfo])
    }
}
export default new NotificationRepo()
