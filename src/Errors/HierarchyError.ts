import { CustomError } from './Common'

export class PageNotExists extends CustomError {}

export class ParentVisibilityNarrow extends CustomError {}

export class ChildrenVisibilityWide extends CustomError {}
