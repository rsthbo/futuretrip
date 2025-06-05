import { FieldNamesAndMessages } from "/imports/api/lib/helpers";
import { defaultSecurityLevel } from "../../security";
import { EnumControltypes, EnumFieldTypes, EnumMethodResult } from "/imports/api/consts";

import { IGenericApp } from "/imports/api/types/app-types";
import { DefaultAppActions, DefaultReportActions } from "../../defaults";

import { Apm } from "..";
import { MebedoWorld } from "../../mebedo-world";
import { getAppStore } from "/imports/api/lib/core";
import { IReportRendererExtras } from "/imports/api/types/world";

export interface Software extends IGenericApp {
    lieferantId: string
    version: string
    eol: string
    dslLink: string
}

export const Softwareprodukte = Apm.createApp<Software>('software', {
    title: "Software",
    description: "Verwaltung aller Softwarelösungen, die genutzt werden", 
    icon: 'fa-fw fas fa-play',
    position: 1,
    
    namesAndMessages: {
        singular: { mitArtikel: 'die Software', ohneArtikel: 'Software' },
        plural: { mitArtikel: 'die Softwareprodukte', ohneArtikel: 'Softwareprodukte' },

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

        eol: {
            type: EnumFieldTypes.ftString,
            ...FieldNamesAndMessages('das', 'End-of-Life Datum', 'das', 'End-of-Life Datum'),
            ...defaultSecurityLevel
        },

        version: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true },
            ],
            ...FieldNamesAndMessages('die', 'Version', 'die', 'Versionen'),
            ...defaultSecurityLevel
        },

        dslLink: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true },
            ],
            ...FieldNamesAndMessages('der', 'DSL-Link', 'die', 'DSL-Links'),
            ...defaultSecurityLevel
        },

        lieferantId: {
            type: EnumFieldTypes.ftAppLink,
            appLink:  /*< IAppLink<Lieferant> > */ {
                app: 'lieferanten',
                hasDescription: true,
                hasImage: false,
                linkable: true
            },
            ...FieldNamesAndMessages('der', 'Lieferant', 'die', 'Lieferanten'),
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
                        { field: 'eol', title: 'End-of-Life Datum', controlType: EnumControltypes.ctDateInput },
                        { field: 'version', controlType: EnumControltypes.ctStringInput },
                        { field: 'dslLink', controlType: EnumControltypes.ctStringInput },
                        { field: 'lieferantId', controlType: EnumControltypes.ctAppLink },
                    ]},
                ]},
            ]
        },
    },

    actions: {
        //...DefaultAppActions.removeDocument(['ADMIN', 'BACKOFFICE'], { environment:['Dashboard']}),
        ...DefaultAppActions.newDocument(['ADMIN', 'BACKOFFICE'], { environment:['Dashboard' ]}),
        ...DefaultAppActions.editDocument(['ADMIN', 'BACKOFFICE']),
    },

    methods: { 
        defaults: async () => { 
            return { 
                status: EnumMethodResult.STATUS_OKAY,
                /*defaults: {
                    lieferantId: [
                        { id: '607f5f680e4cd714bdd5d9b1', title: 'test', description:'testdescr' }
                    ]                   
                }*/
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
                        { _id:'dashboard-software-produkte-all', width: { xs: 24, sm:24, md:24, lg:12 },  type: 'report', details: { type: 'table', reportId: 'software-all'/*, document: { adressart: 'sonstiges' } */} },
                    ]
                },
            ]
        },
    },
});


/**
 * Report - Alle Softwareprodukte
 */
export const ReportSoftwareAll = MebedoWorld.createReport<Software, any>('software-all' , {  
    title: 'Alle Softwareprodukte',
    description: 'Zeigt alle Softwareprodukte.',

    isStatic: false,
    liveDatasource: ({ isServer, publication, currentUser }) => {
        if (isServer && !currentUser) return publication?.ready();
        
        const appStore = isServer ? Softwareprodukte : getAppStore('software');

        return appStore.find({}, { sort: { title: 1 } });
    },
    type: 'table',
    tableDetails: {
        columns: [
            {
                title: 'Software',
                dataIndex: 'title',
                key: 'title',
                render: (title: any, software, extras: IReportRendererExtras) => {                
                    //const _id = lieferant._id;
                    const { _id } = software;
                    const { isExport } = extras;

                    return (
                        isExport 
                            ? title
                            : <a href={`/apm/software/${_id}`}>{title}</a>
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
        DefaultReportActions.openDocument(['EVERYBODY'], Softwareprodukte),
        DefaultReportActions.shareDocument(['EVERYBODY'], Softwareprodukte, { type: 'secondary' }),
        DefaultReportActions.removeDocument(['ADMIN'], Softwareprodukte, { type: 'more' })
    ]
});