
import { v4 as uuidv4 } from 'uuid'
import Document from '../Domain/Document'
import BaseRepo from './BaseRepo'
import env from '../env'
import { OpenSearch } from '@newturn-develop/molink-utils'
import { DocumentVisibility } from '@newturn-develop/types-molink'

class DocumentRepo extends BaseRepo {
    async saveDocument (userId: number, title: string, visibility: string, icon: string, parentId: string | null, order: number, location: string, contentId: string, editionInfoId: string) {
        const id = await OpenSearch.insert('knowlink-document', 'document', {
            userId,
            title,
            visibility,
            icon,
            parentId,
            order,
            location,
            contentId,
            editionInfoId,
            createdAt: new Date(),
            updatedAt: new Date()
        }) as string
        return id
    }

    async saveDocumentHierarchynfo (userId: number, order: number, parentId: string | null) {
        const id = uuidv4()
        const tableName = `knowlink-document-hierarchy-info-${env.isProduction ? 'production' : 'development'}-table`
        this._insertToDynamo(tableName, {
            id,
            userId,
            order,
            parentId
        })
        return id
    }

    async saveDocumentEditionInfo (userId: number) {
        const id = uuidv4()
        const tableName = `knowlink-document-edition-info-${env.isProduction ? 'production' : 'development'}-table`
        this._insertToDynamo(tableName, {
            id,
            userId,
            selectionPath: null,
            selectionOffset: null,
            isLocked: false
        })
        return id
    }

    rawSourceToDocument (id: string, source: any) {
        return new Document(id, source.userId, source.title, source.icon, source.order, source.isChildrenOpen, source.parentId, source.visibility, source.createdAt, source.updatedAt, source.contentId, source.editionInfoId)
    }

    async getDocumentsByUserId (userId: number) {
        const rawDocuments = await OpenSearch.select('knowlink-document', {
            query: {
                term: { userId }
            },
            size: 2000
        }) as any
        return rawDocuments.map((raw: any) => {
            const { _id: id, _source: source } = raw
            return this.rawSourceToDocument(id, source)
        }) as Document[]
    }

    async searchDocuments (userId: number, text: string, followingUsers: number[]) {
        const rawDocuments = await OpenSearch.select('knowlink-document', {
            query: {
                bool: {
                    must: [{
                        match: {
                            title: {
                                query: text,
                                fuzziness: 'AUTO'
                            }
                        }
                    }],
                    should: [
                        {
                            term: {
                                visibility: 2
                            }
                        },
                        {
                            term: {
                                userId
                            }
                        },
                        {
                            bool: {
                                must: [
                                    {
                                        term: {
                                            visibility: 1
                                        }
                                    },
                                    {
                                        terms: {
                                            userId: followingUsers
                                        }
                                    }]
                            }
                        }
                    ]
                }
            },
            size: 10
        })
        return rawDocuments.map((raw: any) => {
            const { _id: id, _source: source } = raw
            return this.rawSourceToDocument(id, source)
        }) as Document[]
    }

    async getDocument (id: string) {
        const raw = await OpenSearch.get('knowlink-document', id)
        if (!raw) {
            return undefined
        }
        return this.rawSourceToDocument(id, raw)
    }

    async getDocumentsByParentId (parentId: string | null) {
        const rawDocuments = await OpenSearch.select('knowlink-document', {
            query: {
                term: { parentId }
            },
            size: 2000
        }) as any
        return rawDocuments.map((raw: any) => {
            const { _id: id, _source: source } = raw
            return this.rawSourceToDocument(id, source)
        }) as Document[]
    }

    async getRecentPublicDocumentsByUserId (userId: number) {
        const rawDocuments = await OpenSearch.select('knowlink-document', {
            query: {
                bool: {
                    must: [
                        {
                            term: {
                                visibility: 2
                            }
                        },
                        {
                            term: {
                                userId
                            }
                        }
                    ]
                }
            },
            size: 1,
            sort: [{
                'updatedAt.keyword': {
                    order: 'desc'
                }
            }]
        }) as any
        return rawDocuments.map((raw: any) => {
            const { _id: id, _source: source } = raw
            return this.rawSourceToDocument(id, source)
        }) as Document[]
    }

    async getTopLevelDocumentsOfUser (userId: number) {
        const rawDocuments = await OpenSearch.select('knowlink-document', {
            query: {
                bool: {
                    must: [
                        {
                            term: {
                                userId
                            }
                        }
                    ],
                    must_not: [
                        {
                            exists: {
                                field: 'parentId'
                            }
                        }
                    ]
                }
            }
        }) as any
        return rawDocuments.map((raw: any) => {
            const { _id: id, _source: source } = raw
            return this.rawSourceToDocument(id, source)
        }) as Document[]
    }

    async setDocumentTitle (id: string, title: string) {
        await OpenSearch.update('knowlink-document', id, { title, updatedAt: new Date() })
    }

    async setDocumentUpdatedAt (id: string) {
        await OpenSearch.update('knowlink-document', id, { updatedAt: new Date() })
    }

    async deleteDocumentByParentId (parentId: string | null) {
        await OpenSearch.deleteByQuery('knowlink-document', { query: { match: { parentId } } })
    }

    async deleteDocument (id: string) {
        await OpenSearch.delete('knowlink-document', id, 'document')
    }

    async decreaseDocumentsOrder (parentId: string | null, standard: number) {
        const boolClouse = parentId
            ? {
                must: [
                    {
                        match: {
                            parentId
                        }
                    },
                    {
                        range: {
                            order: {
                                gt: standard
                            }
                        }
                    }
                ]
            }
            : {
                must: [
                    {
                        range: {
                            order: {
                                gt: standard
                            }
                        }
                    }
                ],
                must_not: [
                    {
                        exists: {
                            field: 'parentId'
                        }
                    }
                ]
            }
        await OpenSearch.updateByQueryWithScript('knowlink-document', {
            bool: boolClouse
        }, 'ctx._source.order = ctx._source.order - 1')
    }

    async increaseDocumentsOrder (parentId: string | null, standard: number) {
        const boolClouse = parentId
            ? {
                must: [
                    {
                        match: {
                            parentId
                        }
                    },
                    {
                        range: {
                            order: {
                                gte: standard
                            }
                        }
                    }
                ]
            }
            : {
                must: [
                    {
                        range: {
                            order: {
                                gte: standard
                            }
                        }
                    }
                ],
                must_not: [
                    {
                        exists: {
                            field: 'parentId'
                        }
                    }
                ]
            }
        await OpenSearch.updateByQueryWithScript('knowlink-document', {
            bool: boolClouse
        }, 'ctx._source.order = ctx._source.order + 1')
    }

    async setDocumentParentIdAndOrder (id: string, parentId: string | null, order: number) {
        await OpenSearch.update('knowlink-document', id, { parentId })
        await OpenSearch.update('knowlink-document', id, { order })
    }

    async setDocumentIsOpen (id: string, isOpen: boolean) {
        await OpenSearch.update('knowlink-document', id, { isOpen })
    }

    async setDocumentIsChildrenOpen (documentId: string, userId: number, viewerId: number, isChildrenOpen: boolean) {
        const tableName = `molink-document-children-open-${env.isProduction ? 'production' : 'development'}-table`
        if (isChildrenOpen) {
            await this._insertToDynamo(tableName, {
                userId,
                viewerId,
                documentId,
                isOpen: true
            })
        } else {
            await this._deleteDynamoItem(tableName, {
                userId,
                viewerId,
                documentId
            })
        }
    }

    async setDocumentIcon (id: string, icon: string) {
        await OpenSearch.update('knowlink-document', id, { icon, updatedAt: new Date() })
    }

    async setDocumentVisibility (id: string, visibility: DocumentVisibility) {
        await OpenSearch.update('knowlink-document', id, { visibility })
    }

    async setDocumentRepresentative (id: string, representative: boolean) {
        await OpenSearch.update('knowlink-document', id, { representative })
    }

    async setDocumentIsLocked (id: string, isLocked: boolean) {
        await OpenSearch.update('knowlink-document', id, { isLocked })
    }
}
export default new DocumentRepo()
