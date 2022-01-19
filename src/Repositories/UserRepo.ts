import User from '../Domain/User'
import BaseRepo from './BaseRepo'

class UserRepo extends BaseRepo {
    getActiveUserByEmail (email: string): Promise<User | undefined> {
        const queryString = 'SELECT * FROM USER_TB WHERE email = ? AND is_deleted = 0'
        return this._selectSingular(queryString, [email])
    }

    getActiveUserById (id: number): Promise<User | undefined> {
        const queryString = 'SELECT * FROM USER_TB WHERE id = ? AND is_deleted = 0'
        return this._selectSingular(queryString, [id])
    }

    getActiveUserByNickname (nickname: string): Promise<User | undefined> {
        const queryString = 'SELECT * FROM USER_TB WHERE nickname = ? AND is_deleted = 0'
        return this._selectSingular(queryString, [nickname])
    }

    setUserRepresentativeDocumentId (id: number, representativeDocumentId: string | null) {
        const queryString = 'UPDATE USER_TB SET representative_document_id = ? WHERE id = ?'
        return this._update(queryString, [representativeDocumentId, id])
    }
}

export default new UserRepo()
