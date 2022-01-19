import { Dynamo, queryBuilder } from '@newturn-develop/molink-utils'

export default class BaseRepo {
    protected _selectSingular (queryString: string, args: any) {
        return queryBuilder(async (conn: any) => {
            const [rows] = await conn.query(queryString, args)
            return rows[0]
        })
    }

    protected _selectPlural (queryString: string, args: any) {
        return queryBuilder(async (conn: any) => {
            const [rows] = await conn.query(queryString, args)
            return rows
        })
    }

    protected _insert (queryString: string, args: any) {
        return queryBuilder(async (conn: any) => {
            const [obj] = await conn.query(queryString, args)
            return obj.insertId
        })
    }

    protected _insertReturningAffectedRows (queryString: string, args: any) {
        return queryBuilder(async (conn: any) => {
            const [obj] = await conn.query(queryString, args)
            return obj.affectedRows
        })
    }

    protected _update (queryString: string, args: any) {
        return queryBuilder(async (conn: any) => {
            const [obj] = await conn.query(queryString, args)
            return obj.affectedRows
        })
    }

    protected _delete (queryString: string, args: any) {
        return queryBuilder(async (conn: any) => {
            await conn.query(queryString, args)
        })
    }

    protected _check (queryString: string, args: any) {
        return queryBuilder(async (conn: any) => {
            const [rows] = await conn.query(queryString, args)
            return rows.length !== 0
        })
    }

    async _selectItemsByKey (tableName: string, conditionString: string, args = {}, columns = undefined, limit = undefined, ascending = true) {
        const result = await Dynamo.query(tableName, conditionString, args, columns, limit, ascending)
        return result
    }

    async _insertToDynamo (tableName: string, item: any) {
        await Dynamo.putItem(tableName, item)
    }

    async _deleteDynamoItem (tableName: string, item: any) {
        await Dynamo.deleteItem(tableName, item)
    }
}
