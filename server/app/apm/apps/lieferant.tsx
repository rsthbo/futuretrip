import { FieldNamesAndMessages } from "/imports/api/lib/helpers";
import { defaultSecurityLevel } from "../../security";
import { EnumControltypes, EnumFieldTypes, EnumMethodResult } from "/imports/api/consts";

import { IGenericApp } from "/imports/api/types/app-types";
import { DefaultAppActions, DefaultReportActions } from "../../defaults";
import { Apm } from "..";
import { MebedoWorld } from "../../mebedo-world";
import { getAppStore } from "/imports/api/lib/core";
import { IReportRendererExtras } from "/imports/api/types/world";

export interface Lieferant extends IGenericApp {
    strasse: string
    plz: string
    ort: string
    telefon: string
    accountManager: string
}

export const Lieferanten = Apm.createApp<Lieferant>('lieferanten', {
    title: "Lieferanten",
    description: "Verwaltung der Softwarelieferanten", 
    icon: 'fa-fw fas fa-globe-europe',
    position: 1,
    
    namesAndMessages: {
        singular: { mitArtikel: 'der Lieferant', ohneArtikel: 'Lieferant' },
        plural: { mitArtikel: 'die Lieferanten', ohneArtikel: 'Lieferanten' },

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

        strasse: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie die Strasse des Lieferanten an.' },
            ],
            ...FieldNamesAndMessages('der', 'Lieferant', 'die', 'Lieferanten'),
            ...defaultSecurityLevel
        },

        plz: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie die Postleitazhl des Lieferanten an.' },
                { min: 5, message: 'Bitte geben Sie die Postleitazhl mit 5 stelen ein.' },
                { max: 5, message: 'Bitte geben Sie die Postleitazhl mit 5 stelen ein.' },
            ],
            ...FieldNamesAndMessages('die', 'Postleitzahl', 'die', 'Postleitzahlen'),
            ...defaultSecurityLevel
        },

        ort: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie den Ort des Lieferanten an.' },
            ],
            ...FieldNamesAndMessages('der', 'Ort', 'die', 'Orte', { onUpdate: 'den Ort' }),
            ...defaultSecurityLevel
        },

        telefon: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie die Telefonnummer des Account-Managers an.' },
            ],
            ...FieldNamesAndMessages('die', 'Telefonnummer', 'die', 'Telefonnummern'),
            ...defaultSecurityLevel
        },

        accountManager: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie die Namen des Account-Managers an.' },
            ],
            ...FieldNamesAndMessages('der', 'Account-Manager', 'die', 'Account-Manager', { onUpdate: 'den Account-Manager' }),
            ...defaultSecurityLevel
        },
        
    },

    layouts: {
        default: {
            title: 'Standard-layout',
            description: 'dies ist ein universallayout für alle Operationen',

            visibleBy: ['ADMIN'],
            
            elements: [
                { controlType: EnumControltypes.ctColumns, columns: [
                    { columnDetails: { xs:24, sm:24, md: 24, lg: 24, xl:24, xxl:24 }, elements: [
                        { field: 'title', controlType: EnumControltypes.ctStringInput },
                        { field: 'description', title: 'Beschreibung', controlType: EnumControltypes.ctStringInput },
                        { field: 'strasse', title: 'Straße', controlType: EnumControltypes.ctStringInput },
                        { field: 'plz', controlType: EnumControltypes.ctStringInput },
                        { field: 'ort', controlType: EnumControltypes.ctStringInput },
                        { field: 'accountManager', controlType: EnumControltypes.ctStringInput },
                        { field: 'telefon', controlType: EnumControltypes.ctStringInput },
                    ]},
                ]},
            ]
        },
    },

    actions: {
        //...DefaultAppActions.removeDocument(['ADMIN', 'BACKOFFICE'], { environment:['Dashboard']}),
        ...DefaultAppActions.newDocument(['ADMIN', 'BACKOFFICE'], { environment:['Dashboard', 'Document']}),
        ...DefaultAppActions.editDocument(['ADMIN', 'BACKOFFICE']),
    },

    methods: { 
        defaults: async () => {
            return { 
                status: EnumMethodResult.STATUS_OKAY,                
            }
        }
    },

    dashboardPicker: () => {
        return 'default';
    },

    dashboards: {
        default: { 
            rows: [
                {
                    elements: [
                        { _id:'dashboard-lieferanten-all', width: { xs: 24, sm:24, md:24, lg:12 },  type: 'report', details: { type: 'table', reportId: 'lieferanten-all'/*, document: { adressart: 'sonstiges' } */} },
                    ]
                },
            ]
        },
    },
});

/*export const ERR_URLAUBSKONTO_NOT_ACTIVE = 'ERR_URLAUBSKONTO_001';
export const ERR_URLAUBSKONTO_REST_LESS_0 = 'ERR_URLAUBSKONTO_002';

Lieferanten.addRule('init-lieferant', {
    title: 'Initialisierung',
    description: 'Das Urlaubskonto wird mit dem Grundanspruch initalisiert, der zugleich der anfängliche Rest an Urlaubstagen darstellt.',
    
    on: ['beforeInsert'], when: true,
    then: async ({ NEW }) => {
        
    }
});
*/

/**
 * Report - Alle Lieferanten
 */
export const ReportLieferantenAll = MebedoWorld.createReport<Lieferant, any>('lieferanten-all' , {  
    title: 'Alle Lieferanten',
    description: 'Zeigt alle Lieferanten.',

    isStatic: false,
    liveDatasource: ({ isServer, publication, currentUser }) => {
        if (isServer && !currentUser) return publication?.ready();
        
        const appStore = isServer ? Lieferanten : getAppStore('lieferanten');

        return appStore.find({}, { sort: { title: 1 } });
    },
    type: 'table',
    tableDetails: {
        columns: [
            {
                title: 'Lieferant',
                dataIndex: 'title',
                key: 'title',
                render: (title: any, lieferant, extras: IReportRendererExtras) => {                
                    //const _id = lieferant._id;
                    const { _id } = lieferant;
                    const { isExport } = extras;

                    return (
                        isExport 
                            ? title
                            : <a href={`/apm/lieferanten/${_id}`}>{title}</a>
                    );
                }
            },
            {
                title: 'Beschreibung',
                dataIndex: 'description',
                key: 'description',
                render: (title) => title
            },
        ],
    },    
    actions: [
        DefaultReportActions.openDocument(['EVERYBODY'], Lieferanten),
        DefaultReportActions.shareDocument(['EVERYBODY'], Lieferanten, { type: 'secondary' }),
        DefaultReportActions.removeDocument(['ADMIN'], Lieferanten, { type: 'more' })
    ]
});