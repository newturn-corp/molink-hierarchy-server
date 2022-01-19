import { CustomError } from './Common'

export class HierarchyNotExists extends CustomError {}

export class InvalidDocumentLocation extends CustomError {}

export class HierarchyChangeTimeout extends CustomError {}
