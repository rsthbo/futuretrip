import { FieldNamesAndMessages } from "/imports/api/lib/helpers";
import { defaultSecurityLevel } from "../../security";

import { EnumControltypes, EnumFieldTypes, EnumMethodResult } from "/imports/api/consts";

import { Konfiguration } from '/server/app/konfiguration';

import { IGenericApp, IGenericRemoveResult } from "/imports/api/types/app-types";
import { MebedoWorld } from "../../mebedo-world";
import { getAppStore } from "/imports/api/lib/core";

import { JaNeinEnum, JaNeinOptionen } from "../../allgemein/apps/ja-nein-optionen";
import { DefaultAppActions } from "../../defaults";

export interface Mandant extends IGenericApp {
    /**
     * Absender, für den Ausdruck von offiziellen Dokumenten,
     * der oberhalb der Empfängeranschrift gedruckt werden soll
     */
    absenderanschrift: string

    /**
     * Daten zur Unternehmung - Firmenname
     **/
    firma: string

    /**
     * Daten zur Unternehmung - strasse
     **/
    strasse: string

    /**
     * Daten zur Unternehmung - Postleitzahl
     **/
    plz: string

    /**
     * Daten zur Unternehmung - Ort
     **/
    ort: string

    /**
     * Allgemeine Kommunikationsdaten - Telefon
     **/
    telefon: string

    /**
     * Allgemeine Kommunikationsdaten - Telefax
     **/
    telefax: string

    /**
     * Allgemeine Kommunikationsdaten - EMail
     **/
    email: string

    /**
     * Geschäftsführer
     **/
    geschaeftsfuehrer: string

    /**
     * Handelsregister
     **/
    handelsregisterNr: string

    /**
     * Gerichtsstand
     **/
    gerichtsstand: string

    /**
     * Umsatzsteuer-Ident-Nummer
     **/
    ustIdentNr: string

    /**
     * Steuernummer
     **/
    steuernummer: string

    /**
     * primäre Bankverbindung - Bankname
     */
    bankname: string

    /**
     * primäre Bankverbindung - IBAN
     */
    iban: string

    /**
     * primäre Bankverbindung - BIC
     */
    bic: string
}

export const Mandanten = Konfiguration.createApp<Mandant>('mandanten', {
    title: "Mandanten",
    description: "Beschreibung der Unternehmungen, die dieses System nutzen",
    icon: 'fa-fw fas fa-home',
    position: 1,
    
    namesAndMessages: {
        singular: { mitArtikel: 'der Mandant', ohneArtikel: 'Mandant' },
        plural: { mitArtikel: 'die Mandanten', ohneArtikel: 'Mandanten' },

        // wenn vorhanden, dann wird die Message genutzt - ansonsten wird
        // die Msg generisch mit singular oder plural generiert
        messages: {
            activityRecordInserted: 'hat den Mandaten erstellt'
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

        absenderanschrift: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { required: true, message: 'Bitte geben Sie eine Absenderanschrift an.' },    
            ],
            ...FieldNamesAndMessages('die', 'Absenderanschrift', 'die', 'Absenderanschriften'),
            ...defaultSecurityLevel
        },

        firma:{
            type: EnumFieldTypes.ftString, 
            rules: [
                { required: true, message: 'Bitte geben Sie die offizielle Fimierung des Unternehmens an.' },    
            ],
            ...FieldNamesAndMessages('das', 'Unternehmen', 'die', 'Unternehmen'),
            ...defaultSecurityLevel
        },

        strasse: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { required: true, message: 'Bitte geben Sie die Straße an.' },    
            ],
            ...FieldNamesAndMessages('die', 'Strasse', 'die', 'Strassen'),
            ...defaultSecurityLevel
        },

        plz: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { required: true, message: 'Bitte geben Sie eine Postleitzahl an.' },    
            ],
            ...FieldNamesAndMessages('die', 'Postleitzahl', 'die', 'Postleitzahlen'),
            ...defaultSecurityLevel
        },

        ort: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { required: true, message: 'Bitte geben Sie den Ort an.' },    
            ],
            ...FieldNamesAndMessages('der', 'Ort', 'die', 'Orte', { onUpdate: 'den Ort' }),
            ...defaultSecurityLevel
        },

        telefon: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { required: true, message: 'Bitte geben Sie eine Telefonnummer an.' },    
            ],
            ...FieldNamesAndMessages('die', 'Telefonnummer', 'die', 'Telefonnummern'),
            ...defaultSecurityLevel
        },

        telefax: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { required: true, message: 'Bitte geben Sie eine Telefaxnummer an.' },    
            ],
            ...FieldNamesAndMessages('die', 'Telefaxnummer', 'die', 'Telefaxnummern'),
            ...defaultSecurityLevel
        },

        email: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { required: true, message: 'Bitte geben Sie eine E-Mail-Adresse an.' },    
            ],
            ...FieldNamesAndMessages('die', 'E-Mail-Adresse', 'die', 'E-Mail-Adressen'),
            ...defaultSecurityLevel

        },

        geschaeftsfuehrer: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { required: true, message: 'Bitte geben Sie den/die benannten Geschäftsführer an.' },    
            ],
            ...FieldNamesAndMessages('die', 'Geschäftsführer', 'die', 'Geschäftsführer'),
            ...defaultSecurityLevel
        },

        handelsregisterNr: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { required: true, message: 'Bitte geben Sie die Handelsregister-Nummer an.' },    
            ],
            ...FieldNamesAndMessages('die', 'Handelsregister-Nummer', 'die', 'Handelsregister-Nummer'),
            ...defaultSecurityLevel
        },

        gerichtsstand: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { required: true, message: 'Bitte geben Sie den Gerichtsstand an.' },    
            ],
            ...FieldNamesAndMessages('der', 'Gerichtsstand', 'die', 'Gerichtsstände', { onUpdate: 'den Gerichtsstand'}),
            ...defaultSecurityLevel
        },

        ustIdentNr: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { required: true, message: 'Bitte geben Sie die Umsatzsteuer-Identnummern an.' },    
            ],
            ...FieldNamesAndMessages('die', 'Umsatzsteuer-Identnummern', 'die', 'Umsatzsteuer-Identnummern'),
            ...defaultSecurityLevel
        },

        steuernummer: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { required: true, message: 'Bitte geben Sie die Steuernummer an.' },    
            ],
            ...FieldNamesAndMessages('die', 'Steuernummer', 'die', 'Steuernummer'),
            ...defaultSecurityLevel
        },

        bankname: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { required: true, message: 'Bitte geben Sie den Banknamen an.' },    
            ],
            ...FieldNamesAndMessages('der', 'Bankname', 'die', 'Banknamen', { onUpdate: 'den Banknamen' }),
            ...defaultSecurityLevel
        },

        iban: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { required: true, message: 'Bitte geben Sie die IBAN an.' },    
            ],
            ...FieldNamesAndMessages('die', 'IBAN', 'die', 'IBAN-Nummern'),
            ...defaultSecurityLevel
        },

        bic: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { required: true, message: 'Bitte geben Sie die BIC an.' },    
            ],
            ...FieldNamesAndMessages('die', 'BIC', 'die', 'BIC`s'),
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
                
                { title:'Allgemeine Angaben',  controlType: EnumControltypes.ctCollapsible, collapsedByDefault: true, elements: [
                    { field: 'firma', controlType: EnumControltypes.ctStringInput },
                    { field: 'strasse', controlType: EnumControltypes.ctStringInput },
                    { title: 'Postleitzahl', controlType: EnumControltypes.ctSpacer, elements: [
                        { field: 'plz', noTitle: true, controlType: EnumControltypes.ctStringInput },
                        { field: 'ort', controlType: EnumControltypes.ctStringInput },
                    ]},
                    { title: 'Kommunikation', controlType:EnumControltypes.ctDivider },
                    { field: 'telefon', controlType: EnumControltypes.ctStringInput },
                    { field: 'telefax', controlType: EnumControltypes.ctStringInput },
                    { field: 'email', controlType: EnumControltypes.ctStringInput },
                ]},

                { title:'Steuerangaben und Handelsregister',  controlType: EnumControltypes.ctCollapsible, elements: [
                    { field: 'ustIdentNr', controlType: EnumControltypes.ctStringInput },
                    { field: 'steuernummer', controlType: EnumControltypes.ctStringInput },
                    { field: 'handelsregisterNr', controlType: EnumControltypes.ctStringInput },
                    { field: 'geschaeftsfuehrer', controlType: EnumControltypes.ctStringInput },
                    { field: 'gerichtsstand', controlType: EnumControltypes.ctStringInput },
                ]},

                { title:'Bankverbindung',  controlType: EnumControltypes.ctCollapsible, elements: [
                    { field: 'bankname', controlType: EnumControltypes.ctStringInput },
                    { field: 'bic', controlType: EnumControltypes.ctStringInput },
                    { field: 'iban', controlType: EnumControltypes.ctStringInput },
                ]},
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
                        { _id:'mandanten-all', width: { xs:24 },  type: 'report', details: { type: 'table', reportId: 'mandanten-all' } },
                    ]
                },
            ]
        },
    },
});


export const ReportMandantenAll = MebedoWorld.createReport<Mandant, never>('mandanten-all', {   
    title: 'Alle Mandanten',
    description: 'Zeigt alle Mandanten.',

    /*sharedWith: [],
    sharedWithRoles: ['EVERYBODY'],*/

    isStatic: false,

    injectables: {
        JaNeinOptionen, janein: JaNeinEnum
    },

    liveDatasource: ({ isServer, publication, currentUser }) => {
        if (isServer && !currentUser) return publication?.ready();
        
        let appStore = isServer ? Mandanten: getAppStore('mandanten');
        return appStore.find({}, { sort: { title: 1 } });
    },

    type: 'table',
    tableDetails: {
        columns: [
            {
                title: 'Mandant',
                key: 'title',
                dataIndex: 'title',
    
            },
            {
                title: 'Beschreibung',
                key: 'description',
                dataIndex: 'description',
            },
            {
                title: 'Unternehmen',
                key: 'firma',
                dataIndex: 'firma',
                render: (firma, doc) => {
                    return (
                        <div>
                            <strong>{firma}</strong><br/>
                            {doc.strasse}<br/>
                            <br/>
                            {doc.plz} {doc.ort}
                        </div>
                    );
                }
            },
        ],    
    },

    actions: [
        {
            title: 'Bearbeiten',
            inGeneral: false,
            type: 'primary',

            description: 'Bearbeiten eines Mandanten',
            icon: 'far fa-edit',
            iconOnly: true,
            
            visibleAt: ['ReportPage', 'Dashboard'],

            visibleBy: [ 'ADMIN' ],
            executeBy: [ 'ADMIN' ],

            onExecute: { 
                redirect: '/konfiguration/mandanten/{{rowdoc._id}}'
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
                        title: `Möchten Sie den Mandanten wirklich löschen?`,
                        content: <div>Das Löschen des Mandanten <b>{row.title}</b> kann nicht rückgängig gemacht werden!</div>,
                        onOk() {
                            invoke('mandanten.removeDocument', row._id, (err: any, res: IGenericRemoveResult) => {
                                if (err) {
                                    console.log(err);
                                    return message.error('Es ist ein unbekannter Fehler aufgetreten.');
                                }
                                if (res.status == EnumMethodResult.STATUS_OKAY) {
                                    return message.success('Der Mandant wurde erfolgreich gelöscht');
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