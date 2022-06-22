import { BaseRepo } from '@newturn-develop/molink-utils'
import { User } from '@newturn-develop/types-molink'

class UserRepo extends BaseRepo {
    getActiveUserById (id: number): Promise<User | undefined> {
        const queryString = 'SELECT * FROM USER_TB WHERE id = ? AND is_deleted = 0'
        return this._selectSingular(queryString, [id])
    }
}

export default new UserRepo()
