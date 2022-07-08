import { BaseRepo } from '@newturn-develop/molink-utils'
import { BlogNotification, BlogNotificationType, Notification, NotificationType } from '@newturn-develop/types-molink'

class NotificationRepo extends BaseRepo {
    public getActiveNotifications (userID: number, blogID: number): Promise<BlogNotification[]> {
        const queryString = 'SELECT * FROM BLOG_NOTIFICATION_TB WHERE blog_id = ? AND user_id = ? AND checked_at IS NULL'
        return this._selectPlural(queryString, [blogID, userID])
    }

    async setActiveNotificationViewedAt (userID: number, blogID: number) {
        const queryString = 'UPDATE BLOG_NOTIFICATION_TB SET viewed_at = ? WHERE user_id = ? AND blog_id = ? AND checked_at IS NULL AND viewed_at IS NULL'
        return this._update(queryString, [new Date(), userID, blogID])
    }

    async setActiveNotificationCheckedAt (userID: number, blogID: number) {
        const queryString = 'UPDATE BLOG_NOTIFICATION_TB SET checked_at = ? WHERE user_id = ? AND blog_id = ? AND checked_at IS NULL AND viewed_at IS NOT NULL'
        return this._update(queryString, [new Date(), userID, blogID])
    }

    public async saveNotification (blogID: number, userID: number, notificationType: BlogNotificationType, content: string, additionalInfo: string) {
        const queryString = 'INSERT INTO BLOG_NOTIFICATION_TB(blog_id, user_id, notification_type, notification_content, additional_info) VALUES(?, ?, ?, ?, ?)'
        return this._insert(queryString, [blogID, userID, notificationType, content, additionalInfo])
    }
}
export default new NotificationRepo()
