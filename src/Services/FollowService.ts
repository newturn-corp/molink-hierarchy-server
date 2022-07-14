import {
    AcceptFollowRequestDTO, Blog, ESUser,
    FollowRequestDTO, FollowRequestInfo,
    GetFollowMapResponseDTO,
    GetMyFollowRequestResponseDTO,
    NotificationType,
    RejectFollowRequestDTO,
    User
} from '@newturn-develop/types-molink'
import BlogFollowRepo from '../Repositories/BlogFollowRepo'
import BlogRepo from '../Repositories/BlogRepo'
import { BlogNotExists, UnauthorizedForBlog } from '../Errors/HierarchyError'
import {
    AlreadyFollowing,
    AlreadyFollowRequested,
    AlreadyHandledRequest,
    FollowRequestNotExists
} from '../Errors/FollowError'
import BlogFollowRequestRepo from '../Repositories/BlogFollowRequestRepo'
import { ViewerAPI } from '../API/ViewerAPI'
import NotificationRepo from '../Repositories/NotificationRepo'
import ESBlogRepo from '../Repositories/ESBlogRepo'
import ESUserRepo from '../Repositories/ESUserRepo'

export class FollowService {
    viewerAPI: ViewerAPI

    constructor (viewerAPI: ViewerAPI) {
        this.viewerAPI = viewerAPI
    }

    // 특정 블로그의 팔로우 요청들을 가져오는 API
    async getActiveBlogFollowRequests (user: User, blogID: number) {
        const authority = await this.viewerAPI.getBlogAuthority(blogID)
        if (!authority.handleFollow) {
            throw new UnauthorizedForBlog()
        }
        const requests = await BlogFollowRequestRepo.getActiveBlogFollowRequests(user.id)
        const followers = await ESUserRepo.getUserInfoListByIdList(requests.map(req => req.user_id))
        const followerMap = new Map<number, ESUser>()
        followers.forEach(follower => followerMap.set(Number(follower.id), follower))
        return requests.map(request => {
            const follower = followerMap.get(request.user_id) as ESUser
            return new FollowRequestInfo(
                request.id,
                Number(follower.id),
                follower.profileImageUrl,
                follower.nickname,
                !!request.viewed_at,
                request.created_at
            )
        })
    }

    async rejectBlogFollowRequest (user: User, dto: RejectFollowRequestDTO) {
        const request = await BlogFollowRequestRepo.getBlogFollowRequest(dto.followRequestId)
        if (!request) {
            throw new FollowRequestNotExists()
        }

        const authority = await this.viewerAPI.getBlogAuthority(request.blog_id)
        if (!authority.handleFollow) {
            throw new UnauthorizedForBlog()
        }
        if (request.accepted_at || request.rejected_at) {
            throw new AlreadyHandledRequest()
        }
        await BlogFollowRequestRepo.setFollowRequestRejected(request.id)
    }

    async acceptFollowRequest (user: User, dto: AcceptFollowRequestDTO) {
        const request = await BlogFollowRequestRepo.getBlogFollowRequest(dto.followRequestId)
        if (!request) {
            throw new FollowRequestNotExists()
        }
        const authority = await this.viewerAPI.getBlogAuthority(request.blog_id)
        if (!authority.handleFollow) {
            throw new UnauthorizedForBlog()
        }
        if (request.accepted_at || request.rejected_at) {
            throw new AlreadyHandledRequest()
        }
        await BlogFollowRequestRepo.setFollowRequestAccepted(request.id)
        await BlogFollowRepo.saveBlogFollow(request.blog_id, request.user_id)
        await ESBlogRepo.addBlogFollowCount(request.blog_id)
        const followBlog = await BlogRepo.getActiveBlog(request.blog_id) as Blog
        await NotificationRepo.saveNotification(
            request.user_id,
            NotificationType.FollowAccept,
            `<b>${followBlog.blog_name}</b>에 대한 팔로우 요청이 수락되었습니다.`,
            user.id,
            followBlog.id.toString()
        )
    }

    async follow (dbUser: User, dto: FollowRequestDTO) {
        const { targetId } = dto
        const targetBlog = await BlogRepo.getActiveBlog(targetId)
        if (!targetBlog) {
            throw new BlogNotExists()
        }
        const isAlreadyFollowing = await BlogFollowRepo.checkFollowByBlogIDAndUserID(targetId, dbUser.id)
        if (isAlreadyFollowing) {
            throw new AlreadyFollowing()
        }
        const isAlreadyFollowRequested = await BlogFollowRequestRepo.checkActiveFollowRequestByBlogIDAndUserID(targetId, dbUser.id)
        if (isAlreadyFollowRequested) {
            throw new AlreadyFollowRequested()
        }

        await BlogFollowRequestRepo.saveFollowRequest(targetId, dbUser.id)
    }
}
