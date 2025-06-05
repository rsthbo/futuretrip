import { FieldNamesAndMessages } from "/imports/api/lib/helpers";
import { defaultSecurityLevel } from "../../security";

import { EnumControltypes, EnumFieldTypes, EnumMethodResult } from "/imports/api/consts";

import { Konfiguration } from '/server/app/konfiguration';

import { AppData, IGenericApp, IGenericRemoveResult, TAppLink, TOptionValues } from "/imports/api/types/app-types";
import { MebedoWorld } from "../../mebedo-world";
import { getAppStore } from "/imports/api/lib/core";

import Tag from 'antd/lib/tag';
import { JaNeinEnum, JaNeinOptionen } from "../../allgemein/apps/ja-nein-optionen";
import { Einheiten, EinheitenEnum } from "../../consulting/apps/einheiten";
import { DefaultAppActions } from "../../defaults";

export interface Artikel extends IGenericApp {
    /**
     * Ausführliche Artikelbeschreibung
     */
    artikelbeschreibung: string
    /**
     * Definiert die Grundeinheit des Artikels
     */
    einheit: EinheitenEnum
    /**
     * Definiert, ob der Artikel noch aktive in einer
     * Auswahl angeboten wird
     */
    active: JaNeinEnum

    /**
     * Definition der Umsatzsteuerbehandlung
     * und des Erlöskontos
     */
    kontriergruppe: TAppLink
}

export const Artikels = Konfiguration.createApp<Artikel>('artikel', {
    title: "Artikel",
    description: "Beschreibung aller notwendigen Artikel.",
    icon: 'fa-fw fas fa-tag',
    position: 1,
    
    namesAndMessages: {
        singular: { mitArtikel: 'der Artikel', ohneArtikel: 'Artikel' },
        plural: { mitArtikel: 'die Artikel', ohneArtikel: 'Artikel' },

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

        artikelbeschreibung: {
            type: EnumFieldTypes.ftString, 
            rules: [
                //{ required: true, message: 'Bitte geben Sie eine ausführliche Artikelbeschreibung an.' },    
            ],
            ...FieldNamesAndMessages('die', 'Artikelbeschreibung', 'die', 'Artikelbeschreibung'),
            ...defaultSecurityLevel
        },

        einheit: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { required: true, message: 'Bitte geben Sie eine Einheit an, in der dieser Artikel geführt wird.' },    
            ],
            ...FieldNamesAndMessages('die', 'Einheit', 'die', 'Einheiten'),
            ...defaultSecurityLevel
        },

        active: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie an, ob die Preisliste noch aktiv ausgewählt werden kann.' },
            ],
            ...FieldNamesAndMessages('die', 'Aktivierung', 'die', 'Aktivierung'),
            ...defaultSecurityLevel
        },

        kontriergruppe: {
            type: EnumFieldTypes.ftAppLink,
            appLink: {
                app: 'kontiergruppen',
                hasDescription: true,
                hasImage: false,
                linkable: true
            },
            rules: [
                { required: true, message: 'Bitte geben Sie an, wie dieser Artikel für das Rechnungswesen behandelt werden soll.' },
            ],
            ...FieldNamesAndMessages('die', 'Kontiergruppe', 'die', 'Kontiergruppen'),
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
                
                { field: 'artikelbeschreibung', controlType: EnumControltypes.ctHtmlInput },
                { field: 'einheit', controlType: EnumControltypes.ctOptionInput, values: Einheiten },
                { field: 'active', title: 'Aktiv', controlType: EnumControltypes.ctOptionInput, values: JaNeinOptionen },
            ]
        },
    },

    actions: {
        ...DefaultAppActions.newDocument(['ADMIN']),
        ...DefaultAppActions.editDocument(['ADMIN']),
        ...DefaultAppActions.removeDocument(['ADMIN'])
    },

    methods: {

    },

    dashboardPicker: () => 'default',
    dashboards: {
        default: { 
            rows: [
                {
                    elements: [
                        { _id:'artikel-all', width: { xs:24 },  type: 'report', details: { type: 'table', reportId: 'artikel-all' } },
                    ]
                },
            ]
        },
    },
});


export const ReportArtikelAll = MebedoWorld.createReport<Artikel, never>('artikel-all', {    
    title: 'Alle Artikel',
    description: 'Zeigt alle Artikel.',

    isStatic: false,

    injectables: {
        JaNeinOptionen, janein: JaNeinEnum
    },

    liveDatasource: ({ isServer, publication, currentUser }) => {
        if (isServer && !currentUser) return publication?.ready();
        
        const Artikel = getAppStore('artikel');
        return Artikel.find({}, { sort: { title: 1 } });
    },

    type: 'table',
    tableDetails: {
        columns: [
            {
                title: 'Artikel',
                key: 'title',
                dataIndex: 'title',

            },
            {
                title: 'Kurzbeschreibung',
                key: 'description',
                dataIndex: 'description',
            },
            {
                title: 'Status',
                key: 'active',
                dataIndex: 'active',
                align: 'center',
                render: (active: string, _artikel: AppData<Artikel>, { injectables }) => {
                    const { JaNeinOptionen }: { JaNeinOptionen: TOptionValues<JaNeinEnum> } = injectables as any;
                    
                    const a = JaNeinOptionen.find( jn => jn._id === active );
                    if (!a) return <Tag color='grey'>{`!!${active}!!`}</Tag>
                    
                    return (
                        <div>
                            <Tag style={{color: a.color as string, backgroundColor: a.backgroundColor as string}}>{ a._id == 'ja' ? 'Aktiv': 'Inaktiv' }</Tag>
                        </div>
                    )
                }
            },
        ],
    },

    actions: [
        {
            title: 'Bearbeiten',
            inGeneral: false,
            type: 'primary',

            description: 'Bearbeiten einer Preisliste',
            icon: 'far fa-edit',
            iconOnly: true,
            
            visibleAt: ['ReportPage', 'Dashboard'],

            visibleBy: [ 'ADMIN' ],
            executeBy: [ 'ADMIN' ],

            onExecute: { 
                redirect: '/konfiguration/artikel/{{rowdoc._id}}'
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
                        title: `Artikel löschen?`,
                        //icon: <ExclamationCircleOutlined />,
                        content: <div>Das Löschen des Artikels <b>{row.title}</b> kann nicht rückgängig gemacht werden!</div>,
                        onOk() {
                            invoke('artikel.removeDocument', row._id, (err: any, res: IGenericRemoveResult) => {
                                if (err) {
                                    console.log(err);
                                    return message.error('Es ist ein unbekannter Fehler aufgetreten.');
                                }
                                if (res.status == EnumMethodResult.STATUS_OKAY) {
                                    return message.success('Der Artikel wurde erfolgreich gelöscht');
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