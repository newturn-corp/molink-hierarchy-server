import { BlogNotificationInfo, SaveBlogNotificationInternalDTO, User } from '@newturn-develop/types-molink'
import BlogNotificationRepo from '../Repositories/BlogNotificationRepo'
import { ViewerAPI } from '../API/ViewerAPI'
import { UnauthorizedForBlog } from '../Errors/HierarchyError'
import BlogUserRepo from '../Repositories/BlogUserRepo'

export class NotificationService {
    viewerAPI: ViewerAPI

    constructor (viewerAPI: ViewerAPI) {
        this.viewerAPI = viewerAPI
    }

    async getActiveBlogNotifications (user: User, blogID: number) {
        const authority = await this.viewerAPI.getBlogAuthority(blogID)
        if (!authority.editable) {
            throw new UnauthorizedForBlog()
        }
        const notifications = await BlogNotificationRepo.getActiveNotifications(user.id, blogID)
        return notifications.map(noti => {
            return new BlogNotificationInfo(noti.notification_type, noti.notification_content, noti.additional_info, !!noti.viewed_at, noti.created_at)
        })
    }

    async setNotificationsViewedAt (user: User, blogID: number) {
        const authority = await this.viewerAPI.getBlogAuthority(blogID)
        if (!authority.editable) {
            throw new UnauthorizedForBlog()
        }
        await BlogNotificationRepo.setActiveNotificationViewedAt(user.id, blogID)
    }

    async setNotificationsCheckedAt (user: User, blogID: number) {
        const authority = await this.viewerAPI.getBlogAuthority(blogID)
        if (!authority.editable) {
            throw new UnauthorizedForBlog()
        }
        await BlogNotificationRepo.setActiveNotificationCheckedAt(user.id, blogID)
    }

    // 권한 확인 주의
    async saveBlogNotifications (dto: SaveBlogNotificationInternalDTO) {
        const { blogID, content, type, additionalInfo } = dto
        const blogUsers = await BlogUserRepo.getBlogUsersOfBlog(blogID)
        for (const user of blogUsers) {
            if (dto.exceptIDList.includes(user.id)) {
                continue
            }
            await BlogNotificationRepo.saveNotification(blogID, user.id, type, content, additionalInfo)
        }
    }
}
