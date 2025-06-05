import { Meteor } from "meteor/meteor";
import React from "react";

import { EnumFieldTypes, EnumMethodResult } from "/imports/api/consts";
import { App } from "/imports/api/lib/app";
import { FieldNamesAndMessages } from "/imports/api/lib/helpers";
import { IAppAction, IAppField, IGenericRemoveResult } from "/imports/api/types/app-types"
import { IReportAction } from "/imports/api/types/world";

/**
 * Definition standard Felder, die wir immer wieder verwenden
 */
export const DefaultAppFields = {
    title(permissionByRoles: Array<string>, options?:IAppField<any>) {
        return {
            title: {
                type: EnumFieldTypes.ftString, 
                rules: [
                    { required: true, message: 'Bitte geben Sie den Titel ein.' },    
                ],
                ...FieldNamesAndMessages('der', 'Titel', 'die', 'Titel', { onUpdate: 'den Titel' }),

                visibleBy: permissionByRoles,
                editableBy: permissionByRoles,

                ...options
            } as IAppField<any>
        }
    },
    description(permissionByRoles: Array<string>, options?:IAppField<any>) {
        return { 
            description: {
                type: EnumFieldTypes.ftString, 
                rules: [
                    { required: true, message: 'Bitte geben Sie eine kurze Beschreibung ein.' },    
                ],
                ...FieldNamesAndMessages('die', 'Beschreibung', 'die', 'Beschreibung'),

                visibleBy: permissionByRoles,
                editableBy: permissionByRoles,

                ...options
            } as IAppField<any>
        }
    }
}


export type TAppActionOptions = Partial< IAppAction<unknown> >;

/**
 * Definition, der immer wieder vorkommenden
 * AppActions wie Neu, Bearbeiten, Löschen, etc.
 */
export const DefaultAppActions = {
    backHistory(visibleByRoles: Array<string>, options?: TAppActionOptions) {
        const backHistory: IAppAction<any> = {
            isPrimaryAction: false,

            title: 'Zurück',
            description: 'Einen Schritt in der Browser-History zurück',
            icon: 'fa fa-arrow-left',
            className: 'mbac-app-action-back',

            environment: ['Document'],
            
            visibleBy: visibleByRoles,
            executeBy: visibleByRoles,

            onExecute: { 
                runScript: () => history.back()
            },

            ...options
        };

        return { backHistory };
    },
    newDocument(visibleByRoles: Array<string>, options?: TAppActionOptions) {
        const newDocument: IAppAction<any> = {
            isPrimaryAction: false,

            title: 'Neu',
            description: 'Neuzugang eines Dokuments',
            icon: 'fa fa-plus',
            className: 'mbac-app-action-new',

            environment: ['Dashboard', 'Document'],
            
            visibleBy: visibleByRoles,
            executeBy: visibleByRoles,

            onExecute: { force : 'new' },

            ...options
        };

        return { newDocument };
    },

    editDocument(visibleByRoles: Array<string>, options?: TAppActionOptions) {
        const editDocument: IAppAction<any> = {
            isPrimaryAction: false,

            title: 'Bearbeiten',
            description: 'Bearbeiten des angezeigten Dokuments',
            icon: 'far fa-edit',
            className: 'mbac-app-action-edit',

            environment: ['Document'],
            
            visibleBy: visibleByRoles,
            executeBy: visibleByRoles,

            onExecute: { force: 'edit' },

            ...options
        }

        return { editDocument };
    },
    
    removeDocument(visibleByRoles: Array<string>, options?: TAppActionOptions) {
        const removeDocument: IAppAction<any> = {
            isPrimaryAction: false,

            title: 'Löschen',
            description: 'Löschen des aktuell angezeigten Dokuments',
            icon: 'fa fa-trash',

            className: 'mbac-app-action-remove',

            environment: ['Document'],
            
            visibleBy: visibleByRoles,
            executeBy: visibleByRoles,

            onExecute: { force: 'remove' },
            
            ...options
        };

        return { removeDocument };
    }

}

export type TReportAction = Partial<IReportAction>

/**
 * Definition der standard REPORT-Actions, die immer wieder benutzt werden
 */
export const DefaultReportActions = {
    newDocument(permissionByRoles: Array<string>, app: App<any>, options?: TReportAction): IReportAction {
        return {
            title: 'Neu',
            inGeneral: true,
            type: 'primary',

            description: 'Neuzugang eines Dokuments',
            icon: 'fas fa-plus',

            visibleAt: ['Document'],

            visibleBy: permissionByRoles,
            executeBy: permissionByRoles,

            disabled: ({ mode }) => mode == 'NEW',

            onExecute: { redirect: `/${app.product.productId}/${app.appId}/new` },

            ...options
        } as IReportAction
    },
    openDocument(visibleByRoles: Array<string>, app: App<any>, options?: TReportAction): IReportAction {
        return {
            title: 'Öffnen',
            inGeneral: false,
            type: 'primary',

            description: 'Öffnen des aktuellen Dokuments',
            icon: 'far fa-folder-open',
            iconOnly: true,
            
            visibleAt: ['ReportPage', 'Dashboard'],

            visibleBy: visibleByRoles,
            executeBy: visibleByRoles,

            onExecute: { redirect: `/${app.product.productId}/${app.appId}/{{rowdoc._id}}` },
            
            ...options
        } as IReportAction
    },
    editDocument(visibleByRoles: Array<string>, app: App<any>, options?: TReportAction): IReportAction {
        return {
            title: 'Bearbeiten',
            inGeneral: false,
            type: 'primary',

            description: 'Bearbeiten eines Landes',
            icon: 'far fa-edit',
            iconOnly: true,
            
            visibleAt: ['ReportPage', 'Dashboard'],

            visibleBy: visibleByRoles,
            executeBy: visibleByRoles,

            onExecute: { redirect: `/${app.product.productId}/${app.appId}/{{rowdoc._id}}` },
            
            ...options
        } as IReportAction
    },
    shareDocument(visibleByRoles: Array<string>, app: App<any>, options?: TReportAction): IReportAction {
        return {
            title: 'Teilen',
            inGeneral: false,
            type: 'more',

            description: 'Teilen des aktuellen Dokuments mit anderene Benutzern',
            icon: 'fa fa-share-alt',
            iconOnly: true,
            
            visibleAt: ['ReportPage', 'Dashboard'],

            visibleBy: visibleByRoles,
            executeBy: visibleByRoles,

            onExecute: { redirect: `/${app.product.productId}/${app.appId}/{{rowdoc._id}}` },
            
            ...options
        } as IReportAction
    },
    removeDocument(visibleByRoles: Array<string>, app: App<any>, options?: TReportAction): IReportAction {
        return {
            title: 'Löschen',
            inGeneral: false,
            type: 'secondary',

            description: 'Löschen eines Landes',
            icon: 'fa fa-trash',
            iconOnly: true,

            visibleAt: ['ReportPage', 'Dashboard'],

            visibleBy: visibleByRoles,
            executeBy: visibleByRoles,

            onExecute: {
                context: {
                    appId: app.appId,
                    singular: app.app.namesAndMessages.singular
                },
                runScript: function test(this:{appId:string, singular:any}, { row, document: _doc }, tools ) {
                    const { confirm, message, invoke } = tools;

                    confirm({
                        title: `${this.singular.ohneArtikel} löschen?`,
                        content: <div>Das Löschen von <strong>{row.title}</strong> kann nicht rückgängig gemacht werden!</div>,
                        onOk: () => {
                            invoke(this.appId + '.removeDocument', row._id, (err: Meteor.Error, res: IGenericRemoveResult)=> {
                                if (err) {
                                    console.log(err);
                                    return message.error('Es ist ein unbekannter Fehler aufgetreten.');
                                }
                                if (res.status == EnumMethodResult.STATUS_OKAY) {
                                    return message.success(`${this.singular.mitArtikel} wurde erfolgreich gelöscht.`);
                                }
                                if (res.status == EnumMethodResult.STATUS_ABORT) {
                                    return message.warning(res.statusText);
                                }
                                
                                message.error('Es ist ein Fehler beim Löschen aufgetreten. ' + res.statusText);
                            });
                        }
                    });
                }
            },
        
            ...options
        } as IReportAction
    },
    exportToCSV(visibleByRoles: Array<string>, options?: TReportAction & { filename?: string }): IReportAction {
        const filename = options && options.filename || 'data.csv';
        if(options && options.filename) {
            // delete of property filename must be here because of violation on inserting meta data
            // to __reprots collection and the schema-definition
            delete options.filename;
        }

        return {
            title: 'Export CSV',
            inGeneral: true,
            type: 'secondary',

            description: 'Inhalt des Reports als CSV-Datei exportieren',
            icon: 'fa fa-file-csv',
            iconOnly: false,
            
            visibleAt: ['Document', 'ReportPage', 'Dashboard'],

            visibleBy: visibleByRoles,
            executeBy: visibleByRoles,

            onExecute: { exportToCSV: { filename } },
            
            ...options
        } as IReportAction
    },
}