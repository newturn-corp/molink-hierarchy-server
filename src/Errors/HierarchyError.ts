import { CustomError } from './Common'

export class PageNotExists extends CustomError {}

export class ParentVisibilityNarrow extends CustomError {}

export class ChildrenVisibilityWide extends CustomError {}

export class BlogNotExists extends CustomError {}

export class UnauthorizedForBlog extends CustomError {}
