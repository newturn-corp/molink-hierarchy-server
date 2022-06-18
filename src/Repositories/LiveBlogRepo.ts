import { Knex } from 'knex'
import { getKnexClient } from '@newturn-develop/molink-utils'
import env from '../env'
import * as Y from 'yjs'

interface BlogUpdate {
    id: string;
    blogID: number;
    update: Uint8Array;
}

class LiveBlogRepo {
    client: Knex<BlogUpdate>

    constructor () {
        this.client = getKnexClient('pg', env.postgre.host, env.postgre.user, env.postgre.password, env.postgre.name)
    }

    async getBlog (blogID: number) {
        const updates = await this.client.transaction(async (transaction) => {
            const updates = await this.client<BlogUpdate>('blog').transacting(transaction).where('blogID', blogID).forUpdate().orderBy('id')

            if (updates.length >= 50) {
                const dbYDoc = new Y.Doc()

                dbYDoc.transact(() => {
                    for (const { update } of updates) {
                        Y.applyUpdate(dbYDoc, update)
                    }
                })

                const [mergedUpdates] = await Promise.all([
                    this.client<BlogUpdate>('blog')
                        .transacting(transaction)
                        .insert({ blogID, update: Y.encodeStateAsUpdate(dbYDoc) })
                        .returning('*'),
                    this.client<BlogUpdate>('blog')
                        .transacting(transaction).where('blogID', blogID)
                        .whereIn('id', updates.map(({ id }) => id))
                        .delete()
                ])

                return mergedUpdates
            } else {
                return updates
            }
        })
        if (updates.length === 0) {
            return undefined
        }
        const document = new Y.Doc()
        document.transact(() => {
            for (const { update } of updates) {
                Y.applyUpdate(document, update)
            }
        })
        return document
    }

    async persistBlogUpdate (blogID: number, update: Uint8Array) {
        await this.client('blog').insert({ blogID, update })
    }
}

export default new LiveBlogRepo()
