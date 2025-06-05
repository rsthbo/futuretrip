export const defaultSecurityLevel = {
    visibleBy: ['EVERYBODY'], 
    editableBy: ['ADMIN', 'BACKOFFICE']
}

export const enum RolesEnum {
    EVERYBODY = 'EVERYBODY',
    EXTERN = 'EXTERN',
    EMPLOYEE = 'EMPLOYEE',
    AKADEMIE = 'AKADEMIE',
    CONSULTING = 'CONSULTING',
    ADMIN = 'ADMIN'
}