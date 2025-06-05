import { FieldNamesAndMessages } from "/imports/api/lib/helpers";
import { defaultSecurityLevel } from "../../security";

import { EnumControltypes, EnumFieldTypes, EnumMethodResult } from "/imports/api/consts";

import { IGenericApp, IGenericRemoveResult, TAppLink } from "/imports/api/types/app-types";
import { MebedoWorld } from "../../mebedo-world";
import { getAppStore } from "/imports/api/lib/core";

import { JaNeinEnum, JaNeinOptionen } from "../../allgemein/apps/ja-nein-optionen";
import { Konfiguration } from "..";
import { DefaultAppActions } from "../../defaults";


export interface Laendergruppe extends IGenericApp {
    /**
     * Image Url für die Nationalflagge um diese in der
     * DropDown anzuzeigen
     */
    imageUrl: string

    /**
     * Definition der Laender, die zu dieser Ländergruppe gehören
     */
    laender: TAppLink
}

export const Laendergruppen = Konfiguration.createApp<Laendergruppe>('laendergruppen', {
    title: "Ländergruppen",
    description: "Liste aller Ländergruppen.",
    icon: 'fa-fw fas fa-globe',
    position: 1,
    
    namesAndMessages: {
        singular: { mitArtikel: 'die Ländergruppe', ohneArtikel: 'Ländergruppe' },
        plural: { mitArtikel: 'die Ländergruppen', ohneArtikel: 'Ländergruppen' },

        // wenn vorhanden, dann wird die Message genutzt - ansonsten wird
        // die Msg generisch mit singular oder plural generiert
        messages: {

        }
    },
    
    sharedWith: [],
    sharedWithRoles: ['ADMIN'],

    fields: {
        title: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { required: true, message: 'Bitte geben Sie den Titel ein.' },    
            ],
            ...FieldNamesAndMessages('der', 'Titel', 'die', 'Titel', { onUpdate: 'den Titel' }),
            ...defaultSecurityLevel
        },

        description: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { required: true, message: 'Bitte geben Sie eine kurze Beschreibung ein.' },    
            ],
            ...FieldNamesAndMessages('die', 'Beschreibung', 'die', 'Beschreibung'),
            ...defaultSecurityLevel
        },

        imageUrl: {
            type: EnumFieldTypes.ftString, 
            rules: [ ],
            ...FieldNamesAndMessages('die', 'Bildinformation', 'die', 'Bildinformationen' ),
            ...defaultSecurityLevel
        },

        laender: {
            type: EnumFieldTypes.ftAppLink, 
            appLink: {
                app: 'laender',
                hasDescription: true,
                hasImage: true,
                linkable: true
            },
            rules: [ ],
            ...FieldNamesAndMessages('die', 'Länder', 'die', 'Länder' ),
            ...defaultSecurityLevel
        }
    },

    layouts: {
        default: {
            title: 'Standard-layout',
            description: 'dies ist ein universallayout für alle Operationen',

            visibleBy: ['EVERYBODY'],
            
            elements: [
                { field: 'title', controlType: EnumControltypes.ctStringInput },
                { field: 'description', title: 'Beschreibung', controlType: EnumControltypes.ctStringInput },
                
                { field: 'imageUrl', controlType: EnumControltypes.ctStringInput },
                { field: 'laender', controlType: EnumControltypes.ctAppLink, enabled: () => false /* dient nur der Anzeige und wird seitens der Laender-App gepflegt */ },
            ]
        },
    },

    actions: {
        ...DefaultAppActions.newDocument(['ADMIN'])
    },

    methods: {

    },

    dashboardPicker: () => 'default',
    dashboards: {
        default: { 
            rows: [
                {
                    elements: [
                        { _id:'laendergruppen-all', width: { xs:24 },  type: 'report', details: { type: 'table', reportId: 'laendergruppen-all' } },
                    ]
                },
            ]
        },
    },
});


export const ReportLaendergruppenAll = MebedoWorld.createReport<Laendergruppe, never>('laendergruppen-all', {   
    title: 'Alle Ländergruppen',
    description: 'Zeigt alle Ländergruppen.',

    isStatic: false,

    injectables: {
        JaNeinOptionen, janein: JaNeinEnum
    },

    liveDatasource: ({ isServer, publication, currentUser }) => {
        if (isServer && !currentUser) return publication?.ready();
        
        const appStore = isServer ? Laendergruppen : getAppStore('laendergruppen');
        
        return appStore.find({}, { sort: { title: 1 } });
    },

    type: 'table',
    tableDetails: {
        columns: [
            {
                title: 'Symbol',
                key: 'imageUrl',
                dataIndex: 'imageUrl',
                render: (imageUrl) => <img src={imageUrl} width="48" height="auto" />
            },
            {
                title: 'Ländergruppe',
                key: 'title',
                dataIndex: 'title',

            },
            {
                title: 'Kurzbeschreibung',
                key: 'description',
                dataIndex: 'description',
            },
        ],
    },

    actions: [
        {
            title: 'Bearbeiten',
            inGeneral: false,
            type: 'primary',

            description: 'Bearbeiten einer Ländergruppe',
            icon: 'far fa-edit',
            iconOnly: true,
            
            visibleAt: ['ReportPage', 'Dashboard'],

            visibleBy: [ 'ADMIN' ],
            executeBy: [ 'ADMIN' ],

            onExecute: { 
                redirect: '/konfiguration/laendergruppen/{{rowdoc._id}}'
            }
        },
        {
            title: 'Löschen',
            type: 'secondary',
            description: 'Löschen eines Landes',
            icon: 'fas fa-trash',
            iconOnly: true,

            visibleAt: ['ReportPage', 'Dashboard'],

            visibleBy: [ 'ADMIN' ],
            executeBy: [ 'ADMIN' ],

            onExecute: { 
                runScript: ({ row, document: _doc }, tools ) => {
                    const { confirm, message, invoke } = tools;

                    confirm({
                        title: `Ländergruppe löschen?`,
                        content: <div>Das Löschen des Landes <b>{row.title}</b> kann nicht rückgängig gemacht werden!</div>,
                        onOk() {
                            invoke('laendergruppen.removeDocument', row._id, (err: any, res: IGenericRemoveResult) => {
                                if (err) {
                                    console.log(err);
                                    return message.error('Es ist ein unbekannter Fehler aufgetreten.');
                                }
                                if (res.status == EnumMethodResult.STATUS_OKAY) {
                                    return message.success('Die Ländergruppe wurde erfolgreich gelöscht.');
                                }
                                if (res.status == EnumMethodResult.STATUS_ABORT) {
                                    return message.warning(res.statusText);
                                }
                                
                                message.error('Es ist ein Fehler beim Löschen aufgetreten. ' + res.statusText);
                            });
                        }
                    });
                }
            }
        },
    ]
});