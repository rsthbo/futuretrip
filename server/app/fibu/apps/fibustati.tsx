import { FieldNamesAndMessages } from "/imports/api/lib/helpers";
import { defaultSecurityLevel } from "../../security";

import { EnumControltypes, EnumFieldTypes, EnumMethodResult } from "/imports/api/consts";

import { IGenericApp, IGenericRemoveResult } from "/imports/api/types/app-types";
import { MebedoWorld } from "../../mebedo-world";
import { getAppStore } from "/imports/api/lib/core";

import { Fibu } from "..";
import { DefaultAppActions } from "../../defaults";

export interface FibuStatus extends IGenericApp {

}

export const Fibustati = Fibu.createApp<FibuStatus>('fibustati', {
    title: "Fibustati",
    description: "Beschreibung der Besonderheiten für bestimmte Adressen z. B. Freihäfen",
    icon: 'fa-fw fas fa-award',
    position: 1,
    
    namesAndMessages: {
        singular: { mitArtikel: 'der Fibustatus', ohneArtikel: 'Fibustatus' },
        plural: { mitArtikel: 'die Fibustati', ohneArtikel: 'Fibustati' },

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
    },

    layouts: {
        default: {
            title: 'Standard-layout',
            description: 'dies ist ein universallayout für alle Operationen',

            visibleBy: ['EVERYBODY'],
            
            elements: [
                { field: 'title', controlType: EnumControltypes.ctStringInput },
                { field: 'description', title: 'Beschreibung', controlType: EnumControltypes.ctStringInput },
                
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
                        { _id:'fibustati-all', width: { xs:24 },  type: 'report', details: { type: 'table', reportId: 'fibustati-all' } },
                    ]
                },
            ]
        },
    },
});


export const ReportFibustatiAll = MebedoWorld.createReport<FibuStatus, never>('fibustati-all', {  
    title: 'Alle Fibustati',
    description: 'Zeigt alle Fibustati.',

    /*sharedWith: [],
    sharedWithRoles: ['EVERYBODY'],*/

    isStatic: false,

    liveDatasource: ({ isServer, publication, currentUser }) => {
        if (isServer && !currentUser) return publication?.ready();
        
        let $FibuStati;
        if (isServer)
            $FibuStati = Fibustati;
        else
            $FibuStati = getAppStore('fibustati');
        return $FibuStati.find({}, { sort: { title: 1 } });
    },

    type: 'table',
    tableDetails: {
        columns: [
            {
                title: 'Status',
                key: 'title',
                dataIndex: 'title',

            },
            {
                title: 'Beschreibung',
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

            description: 'Bearbeiten eines Fibustatus',
            icon: 'far fa-edit',
            iconOnly: true,
            
            visibleAt: ['ReportPage', 'Dashboard'],

            visibleBy: [ 'ADMIN' ],
            executeBy: [ 'ADMIN' ],

            onExecute: { 
                redirect: '/fibu/fibustati/{{rowdoc._id}}'
            }
        },
        {
            title: 'Löschen',
            type: 'secondary',
            description: 'Löschen eines Seminarteilnehmers',
            icon: 'fas fa-trash',
            iconOnly: true,

            visibleAt: ['ReportPage', 'Dashboard'],

            visibleBy: [ 'ADMIN' ],
            executeBy: [ 'ADMIN' ],

            onExecute: { 
                runScript: ({ row, document: _doc }, tools ) => {
                    const { confirm, message, invoke } = tools;

                    confirm({
                        title: `Fibustatus löschen?`,
                        content: <div>Das Löschen der Kontiergruppe <b>{row.title}</b> kann nicht rückgängig gemacht werden!</div>,
                        onOk() {
                            invoke('fibustati.removeDocument', row._id, (err: any, res: IGenericRemoveResult) => {
                                if (err) {
                                    console.log(err);
                                    return message.error('Es ist ein unbekannter Fehler aufgetreten.');
                                }
                                if (res.status == EnumMethodResult.STATUS_OKAY) {
                                    return message.success('Der Fibustatus wurde erfolgreich gelöscht.');
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