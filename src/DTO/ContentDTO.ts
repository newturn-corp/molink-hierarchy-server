export class UpdateContentDto {
    id: string
    content: any

    constructor (id: string, content: any) {
        this.id = id
        this.content = content
    }
}
