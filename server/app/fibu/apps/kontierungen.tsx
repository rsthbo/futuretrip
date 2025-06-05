import { FieldNamesAndMessages } from "/imports/api/lib/helpers";
import { defaultSecurityLevel } from "../../security";

import { EnumControltypes, EnumFieldTypes, EnumMethodResult } from "/imports/api/consts";

import { AppData, IGenericApp, IGenericRemoveResult, TAppLink } from "/imports/api/types/app-types";
import { MebedoWorld } from "../../mebedo-world";
import { getAppStore } from "/imports/api/lib/core";

import { Fibu } from "..";
import { DefaultAppActions } from "../../defaults";

export interface Kontierung extends IGenericApp {
    /**
     * Zugehörigkeit dieser Kontierung zu einer Gruppe
     */
    kontiergruppe: TAppLink

    /**
     * Zugehörigkeit zu einem Mandanten
     */
    mandant: TAppLink

    /**
     * Zugehörigkeit zu einer Länergruppe
     */
    laendergruppe: TAppLink

    /**
     * Zugehörigkeit zu einem Land
     */
    land: TAppLink

    /**
     * Zugehörigkeit zu einem Fibustatus, 
     * der aus der Adresse herangezogen wird
     */
    fibustatus: TAppLink

    /**
     * Gültigkeit dieser Kontierung
     */
    gueltigkeit: Array<Date>

    /**
     * Umsatzsteuersatz VH i.d.R. 0, 7 oder 19 
     */
    ustsatzVh: number,

    /**
     * Steuerschlüssel wie er von der angebundenen Fibu gefordert wird
     */
    steuerschluessel: string
    /**
     * Steuerkonto, auf das die Umsatzsteuer kontiert werden soll
     */
    steuerkonto: string

    /**
     * Erlöskonto auf das der Nettoerloes gebucht werden soll
     */
    erloeskonto: string
}

export const Kontierungen = Fibu.createApp<Kontierung>('kontierungen', {
    title: "Kontierungen",
    description: "Beschreibung der zeitabhängigen Umsatzsteuerbehandlung, Erlöskonten, etc. für das Rechnungswesen.",
    icon: 'fa-fw fas fa-columns',
    position: 1,
    
    namesAndMessages: {
        singular: { mitArtikel: 'die Kontierung', ohneArtikel: 'Kontierung' },
        plural: { mitArtikel: 'die Kontierungen', ohneArtikel: 'Kontierungen' },

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

        gueltigkeit: {
            type: EnumFieldTypes.ftDatespan, 
            rules: [
                { required: true, message: 'Bitte geben Sie die Gültigkeit ein.' },    
            ],
            ...FieldNamesAndMessages('die', 'Gültigkeit', 'die', 'Gültigkeiten'),
            ...defaultSecurityLevel
        },

        mandant: {
            type: EnumFieldTypes.ftAppLink,
            appLink: {
                app: 'mandanten',
                hasDescription: true,
                hasImage: false,
                linkable: true
            },
            rules: [],
            ...FieldNamesAndMessages('der', 'Mandant', 'die', 'Mandanten',{ onUpdate: 'den Mandanten' }),
            ...defaultSecurityLevel
        },

        kontiergruppe: {
            type: EnumFieldTypes.ftAppLink,
            appLink: {
                app: 'kontiergruppen',
                hasDescription: true,
                hasImage: false,
                linkable: true
            },
            rules: [],
            ...FieldNamesAndMessages('die', 'Kontiergruppe', 'die', 'Kontiergruppen'),
            ...defaultSecurityLevel
        },

        fibustatus: {
            type: EnumFieldTypes.ftAppLink,
            appLink: {
                app: 'fibustati',
                hasDescription: true,
                hasImage: false,
                linkable: true
            },
            rules: [],
            ...FieldNamesAndMessages('der', 'Fibustatus', 'die', 'Fibustati', { onUpdate: 'den Fibustatus' }),
            ...defaultSecurityLevel
        },

        laendergruppe: {
            type: EnumFieldTypes.ftAppLink,
            appLink: {
                app: 'laendergruppen',
                hasDescription: true,
                hasImage: true,
                linkable: true
            },
            rules: [],
            ...FieldNamesAndMessages('die', 'Ländergruppe', 'die', 'Ländergruppen'),
            ...defaultSecurityLevel
        },
        land: {
            type: EnumFieldTypes.ftAppLink,
            appLink: {
                app: 'laender',
                hasDescription: true,
                hasImage: false,
                linkable: true
            },
            rules: [],
            ...FieldNamesAndMessages('das', 'Land', 'die', 'Länder'),
            ...defaultSecurityLevel
        },

        ustsatzVh: {
            type: EnumFieldTypes.ftInteger, 
            rules: [
                { required: true, message: 'Bitte geben Sie die Gültigkeit ein.' },
                { type: 'number', min: 0, max: 100, message: 'Bitte geben Sie einen gültigen Steuersatz zwischen 0 und 100 an.' },
            ],
            ...FieldNamesAndMessages('die', 'Umsatzsteuer (vH)', 'die', 'Umsatzsteuer (vH)'),
            ...defaultSecurityLevel
        },

        steuerschluessel: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { required: true, message: 'Bitte geben Sie den Steuerschlüssel ein.' },    
            ],
            ...FieldNamesAndMessages('der', 'Steuerschlüssel', 'die', 'Steuerschlüssel', { onUpdate: 'den Steuerschlüssel' }),
            ...defaultSecurityLevel
        },

        steuerkonto: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { required: true, message: 'Bitte geben Sie das Steuerkonto ein.' },    
            ],
            ...FieldNamesAndMessages('das', 'Steuerkonto', 'die', 'Steuerkonto'),
            ...defaultSecurityLevel
        },

        erloeskonto: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { required: true, message: 'Bitte geben Sie das Erlöskonto ein.' },    
            ],
            ...FieldNamesAndMessages('das', 'Erlöskonto', 'die', 'Erlöskonten'),
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
                
                { field: 'gueltigkeit', controlType: EnumControltypes.ctDatespanInput },

                { title: 'Referenzierung', controlType: EnumControltypes.ctDivider },
                { field: 'mandant', controlType: EnumControltypes.ctAppLink, maxItems: 200 },
                { field: 'kontiergruppe', controlType: EnumControltypes.ctAppLink, maxItems: 200 },
                { field: 'fibustatus', controlType: EnumControltypes.ctAppLink, maxItems: 200 },
                { field: 'laendergruppe', controlType: EnumControltypes.ctAppLink, maxItems: 200 },
                { field: 'land', controlType: EnumControltypes.ctAppLink, maxItems: 200 },

                { title: 'Kontierung', controlType: EnumControltypes.ctDivider },
                { field: 'ustsatzVh', controlType: EnumControltypes.ctNumberInput },
                { field: 'steuerschluessel', controlType: EnumControltypes.ctStringInput },
                { field: 'steuerkonto', controlType: EnumControltypes.ctStringInput },
                { field: 'erloeskonto', controlType: EnumControltypes.ctStringInput },
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
                        { _id:'kontierungen-all', width: { xs:24 },  type: 'report', details: { type: 'table', reportId: 'kontierungen-all' } },
                    ]
                },
            ]
        },
    },
});


export const ReportKontierungenAll = MebedoWorld.createReport<Kontierung, never>('kontierungen-all', {    
    title: 'Alle Kontierungen',
    description: 'Zeigt alle Kontierungen.',

    /*sharedWith: [],
    sharedWithRoles: ['EVERYBODY'],*/

    isStatic: false,

    injectables: {
        
    },

    liveDatasource: ({ isServer, publication, currentUser }) => {
        if (isServer && !currentUser) return publication?.ready();
        
        let $Kontierungen;
        if (isServer)
            $Kontierungen = Kontierungen
        else
            $Kontierungen = getAppStore('kontierungen');
        return $Kontierungen.find({}, { sort: { title: 1 } });
    },

    type: 'table',
    tableDetails: {
        columns: [
            {
                title:'Allgemein',
                children: [
                    {
                        title: 'Kontierung',
                        key: 'title',
                        dataIndex: 'title',
            
                    },
                    {
                        title: 'Beschreibung',
                        key: 'description',
                        dataIndex: 'description',
                    },
                    {
                        title: 'Gültigkeit',
                        key: 'gueltigkeit',
                        dataIndex: 'gueltigkeit',
                        render: (gueltigkeit: Array<Date>, _kontierung: AppData<Kontierung>, { moment }) => {
                            return `${moment(gueltigkeit[0]).format('DD.MM.YYYY')} bis ${moment(gueltigkeit[1]).format('DD.MM.YYYY')}`;
                        }
                    },
                ]
            },
            {
                title: 'Fibu',
                children: [
                    {
                        title: 'Steuersatz',
                        key: 'ustsatzVh',
                        dataIndex: 'ustsatzVh',
                        align: 'right'
                    },
                    {
                        title: 'Steuerkonto',
                        key: 'steuerkonto',
                        dataIndex: 'steuerkonto',
                    },
                    {
                        title: 'Erlöskonto',
                        key: 'erloeskonto',
                        dataIndex: 'erloeskonto',
                    },
                ]
            }
        ],
    },

    actions: [
        {
            title: 'Bearbeiten',
            inGeneral: false,
            type: 'primary',

            description: 'Bearbeiten der Kontierung',
            icon: 'far fa-edit',
            iconOnly: true,
            
            visibleAt: ['ReportPage', 'Dashboard'],

            visibleBy: [ 'ADMIN' ],
            executeBy: [ 'ADMIN' ],

            onExecute: { 
                redirect: '/fibu/kontierungen/{{rowdoc._id}}'
            }
        },
        {
            title: 'Löschen',
            type: 'secondary',
            description: 'Löschen einer Kontierung',
            icon: 'fas fa-trash',
            iconOnly: true,

            visibleAt: ['ReportPage', 'Dashboard'],

            visibleBy: [ 'ADMIN' ],
            executeBy: [ 'ADMIN' ],

            onExecute: { 
                runScript: ({ row, document: _doc }, tools ) => {
                    const { confirm, message, invoke } = tools;

                    confirm({
                        title: `Kontierung löschen?`,
                        content: <div>Das Löschen der Kontierung <b>{row.title}</b> kann nicht rückgängig gemacht werden!</div>,
                        onOk() {
                            invoke('kontierungen.removeDocument', row._id, (err: any, res: IGenericRemoveResult) => {
                                if (err) {
                                    console.log(err);
                                    return message.error('Es ist ein unbekannter Fehler aufgetreten.');
                                }
                                if (res.status == EnumMethodResult.STATUS_OKAY) {
                                    return message.success('Die Kontierung wurde erfolgreich gelöscht.');
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