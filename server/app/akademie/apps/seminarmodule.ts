import { FieldNamesAndMessages } from "/imports/api/lib/helpers";
import { defaultSecurityLevel } from "../../security";
import { EnumControltypes, EnumFieldTypes, EnumMethodResult } from "/imports/api/consts";

import { Akademie } from "/server/app/akademie";
import { IGenericApp } from "/imports/api/types/app-types";

import { SeminarEinheiten } from "./seminareinheiten";

// Auslagern...
import { TOptionValues } from '/imports/api/types/app-types';
import { JaNeinEnum, JaNeinOptionen } from "../../allgemein/apps/ja-nein-optionen";
import { DefaultAppActions } from "../../defaults";

export enum TageEnum {
    one = '1',
    two = '2',
    three = '3',
    four = '4',
    five = '5'
}
export const SeminarAnzahlTage: TOptionValues<TageEnum> = [
    { _id: TageEnum.one, title:'1' },
    { _id: TageEnum.two, title:'2' },
    { _id: TageEnum.three, title:'3' },
    { _id: TageEnum.four, title:'4' },
    { _id: TageEnum.five, title:'5' },
];

export interface Seminarmodul extends IGenericApp {
    /**
     * die Bezeichnung des Seminarmoduls
     **/
    modul: string

    /**
     * die Einheit des Seminarmoduls
     **/
    einheit: string

    /**
     * der Seminarcode des Seminarmoduls
     **/
    seminarcode: string

    /**
     * die Anzahl der Tage des Seminarmoduls
     **/
    anzahlTage: number

    /**
     * die Zeiten des 1. Tags des Seminarmoduls
     **/
    Tag1VonBis: Array<Date>

    /**
     * die Zeiten des 2. Tags des Seminarmoduls
     **/
    Tag2VonBis: Array<Date>

    /**
     * die Zeiten des 3. Tags des Seminarmoduls
     **/
    Tag3VonBis: Array<Date>

    /**
     * die Zeiten des 4. Tags des Seminarmoduls
     **/
    Tag4VonBis: Array<Date>

    /**
     * die Zeiten des 5. Tags des Seminarmoduls
     **/
    Tag5VonBis: Array<Date>

    /**
     * die minimale Anzahl an Teilnehmern des Seminarmoduls
     **/
    minTeilnehmer: number
    
    /**
     * die maximale Anzahl an Teilnehmern des Seminarmoduls
     **/
    maxTeilnehmer: number

    /**
     * die Online Alternative zu diesem Seminarmodul
     **/
    onlineAlternative: string

    /**
     * der Kurztext des Seminarmoduls
     **/
    kurzText: string

    /**
     * der Langtext des Seminarmoduls
     **/
    langText: string

    /**
     * ist das Seminarmodul auf der Website verfügbar
     **/
    showOnWebsite: boolean

    /**
     * Text des Seminarmoduls für die Website
     **/
    textOnWebsite: string

    /**
     * ist das Seminarmodul aktiv
     **/
    aktiv: JaNeinEnum
}

export const Seminarmodule = Akademie.createApp<Seminarmodul>({
    _id: 'seminarmodule',
    
    title: "Seminarmodule",
    description: "Alle Seminarmodule, die von uns angeboten werden.", 
    icon: 'fa-fw fas fa-users',
    //icon: 'fa-fw fas fa-school',
    position: 1,
    
    namesAndMessages: {
        singular: { mitArtikel: 'das Seminarmodul', ohneArtikel: 'Seminarmodul' },
        plural: { mitArtikel: 'die Seminarmodule', ohneArtikel: 'Seminarmodule' },

        // wenn vorhanden, dann wird die Message genutzt - ansonsten wird
        // die Msg generisch mit singular oder plural generiert
        messages: {

        }
    },
    
    sharedWith: [],
    sharedWithRoles: ['EVERYBODY','ADMIN'],

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

        modul: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie die Bezeichnung des Seminarmoduls ein.' },
            ],
            ...FieldNamesAndMessages('das', 'Seminarmodul', 'die', 'Seminarmodule'),
            ...defaultSecurityLevel
        },

        einheit: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie die Einheit des Seminarmoduls ein.' },
            ],
            ...FieldNamesAndMessages('die', 'Einheit', 'die', 'Einheiten'),
            ...defaultSecurityLevel
        },

        seminarcode: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie den Seminarcode des Seminarmoduls ein.' },
            ],
            ...FieldNamesAndMessages('der', 'Seminarcode', 'die', 'Seminarcodes'),
            ...defaultSecurityLevel
        },

        anzahlTage: {
            type: EnumFieldTypes.ftInteger,
            rules: [
                { required: true, message: 'Bitte geben Sie die Anzahl der Tage des Seminarmoduls ein.' },
            ],
            ...FieldNamesAndMessages('die', 'Tagesanzahl', 'die', 'Tagesanzahl'),
            ...defaultSecurityLevel
        },

        Tag1VonBis: {
            type: EnumFieldTypes.ftDatespan,
            rules: [
                { required: true, message: 'Bitte geben Sie die Zeiten für den 1. Seminartag ein.' },
            ],
            ...FieldNamesAndMessages('die', 'Zeiten', 'die', 'Zeiten' ),
            ...defaultSecurityLevel
        },

        Tag2VonBis: {
            type: EnumFieldTypes.ftString,
            rules: [
                { message: 'Bitte geben Sie die Zeiten für den 2. Seminartag ein.' },
            ],
            ...FieldNamesAndMessages('die', 'Zeiten', 'die', 'Zeiten' ),
            ...defaultSecurityLevel
        },

        Tag3VonBis: {
            type: EnumFieldTypes.ftString,
            rules: [
                { message: 'Bitte geben Sie die Zeiten für den 3. Seminartag ein.' },
            ],
            ...FieldNamesAndMessages('die', 'Zeiten', 'die', 'Zeiten' ),
            ...defaultSecurityLevel
        },

        Tag4VonBis: {
            type: EnumFieldTypes.ftString,
            rules: [
                { message: 'Bitte geben Sie die Zeiten für den 4. Seminartag ein.' },
            ],
            ...FieldNamesAndMessages('die', 'Zeiten', 'die', 'Zeiten' ),
            ...defaultSecurityLevel
        },

        Tag5VonBis: {
            type: EnumFieldTypes.ftString,
            rules: [
                { message: 'Bitte geben Sie die Zeiten für den 5. Seminartag ein.' },
            ],
            ...FieldNamesAndMessages('die', 'Zeiten', 'die', 'Zeiten' ),
            ...defaultSecurityLevel
        },

        minTeilnehmer: {
            type: EnumFieldTypes.ftInteger,
            rules: [
                { required: true, message: 'Bitte geben Sie minimale Anzahl an Teilnehmern an.' },
            ],
            ...FieldNamesAndMessages('die', 'minimale Teilnehmerzahl', 'die', 'minimale Teilnehmerzahl'),
            ...defaultSecurityLevel
        },

        maxTeilnehmer: {
            type: EnumFieldTypes.ftInteger,
            rules: [
                { required: true, message: 'Bitte geben Sie maximale Anzahl an Teilnehmern an.' },
            ],
            ...FieldNamesAndMessages('die', 'maximale Teilnehmerzahl', 'die', 'maximale Teilnehmerzahl'),
            ...defaultSecurityLevel
        },

        onlineAlternative: {
            type: EnumFieldTypes.ftString,
            rules: [
                { message: 'Bitte geben Sie eine Online Alternative zu diesem Seminarmodul an.' },
            ],
            ...FieldNamesAndMessages('die', 'Online Alternative', 'die', 'Online Alternativen'),
            ...defaultSecurityLevel
        },

        kurzText: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie den Kurztext des Seminarmoduls ein.' },
            ],
            ...FieldNamesAndMessages('der', 'Kurztext', 'die', 'Kurztexte'),
            ...defaultSecurityLevel
        },

        langText: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie den Langtext des Seminarmoduls ein.' },
            ],
            ...FieldNamesAndMessages('der', 'Langtext', 'die', 'Langtexte'),
            ...defaultSecurityLevel
        },

        showOnWebsite: {
            type: EnumFieldTypes.ftBoolean,
            rules: [
                { required: true, message: 'Bitte geben Sie an, ob das Seminarmodul auf der Website angezeigt werden soll.' },
            ],
            ...FieldNamesAndMessages('die', 'Anzeige auf Website', 'die', 'Anzeigen auf Website'),
            ...defaultSecurityLevel
        },

        textOnWebsite: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie den Text des Seminarmoduls für die Website ein.' },
            ],
            ...FieldNamesAndMessages('der', 'Websitetext', 'die', 'Websitetexte'),
            ...defaultSecurityLevel
        },

        aktiv: {
            type: EnumFieldTypes.ftBoolean,
            rules: [
                { required: true, message: 'Bitte geben Sie an, ob das Seminarmodul aktiv ist.' },
            ],
            ...FieldNamesAndMessages('das', 'Seminarmodul aktiv', 'die', 'Seminarmodule aktiv'),
            ...defaultSecurityLevel
        },

        /*beschreibung: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { required: true, message: 'Bitte geben Sie eine Seminarbeschreibung ein.' },
            ],
            ...FieldNamesAndMessages('die', 'Beschreibung', 'die', 'Beschreibungen'),
            ...defaultSecurityLevel
        },*/

    },

    layouts: {
        default: {
            title: 'Standard-layout',
            description: 'dies ist ein universallayout für alle Operationen',

            visibleBy: ['EVERYBODY'],
            
            elements: [
                { controlType: EnumControltypes.ctDivider },
                { field: 'title', controlType: EnumControltypes.ctStringInput },
                { field: 'modul', controlType: EnumControltypes.ctStringInput },
                { field: 'seminarcode', controlType: EnumControltypes.ctStringInput },
                { field: 'einheit', controlType: EnumControltypes.ctOptionInput, values: SeminarEinheiten },
                { field: 'onlineAlternative', controlType: EnumControltypes.ctStringInput },
                { field: 'minTeilnehmer', controlType: EnumControltypes.ctNumberInput },
                { field: 'maxTeilnehmer', controlType: EnumControltypes.ctNumberInput },
                { field: 'aktiv', controlType: EnumControltypes.ctOptionInput, values: JaNeinOptionen },
                { controlType: EnumControltypes.ctDivider },
                //{ field: 'anzahlTage', controlType: EnumControltypes.ctNumberInput }, SeminarAnzahlTage
                { field: 'anzahlTage', controlType: EnumControltypes.ctSlider, sliderDetails: { min: 1, max: 5, tooltipVisible: true } }, 
                { field: 'Tag1VonBis', title:'Tag 1: Durchführung von-bis', controlType: EnumControltypes.ctTimespanInput, 
                    visible: (props:any) => {
                        if ( !props || !props.allValues )
                            return false;
                        const { anzahlTage } = props.allValues;                        
                        if (anzahlTage >= 1 )
                            return true;
                        return false;
                    },
                },
                { field: 'Tag2VonBis', title:'Tag 2: Durchführung von-bis', controlType: EnumControltypes.ctTimespanInput, 
                    visible: (props:any) => {
                        if ( !props || !props.allValues )
                            return false;
                        const { anzahlTage } = props.allValues;
                        if (anzahlTage >= 2 )
                            return true;
                        return false;
                    },
                },
                { field: 'Tag3VonBis', title:'Tag 3: Durchführung von-bis', controlType: EnumControltypes.ctTimespanInput, 
                    visible: (props:any) => {
                        if ( !props || !props.allValues )
                            return false;
                        const { anzahlTage } = props.allValues;
                        if (anzahlTage >= 3 )
                            return true;
                        return false;
                    },
                },
                { field: 'Tag4VonBis', title:'Tag 4: Durchführung von-bis', controlType: EnumControltypes.ctTimespanInput, 
                    visible: (props:any) => {
                        if ( !props || !props.allValues )
                            return false;
                        const { anzahlTage } = props.allValues;
                        if (anzahlTage >= 4 )
                            return true;
                        return false;
                    },
                },
                { field: 'Tag5VonBis', title:'Tag 5: Durchführung von-bis', controlType: EnumControltypes.ctTimespanInput, 
                    visible: (props:any) => {
                        if ( !props || !props.allValues )
                            return false;
                        const { anzahlTage } = props.allValues;
                        if (anzahlTage >= 5 )
                            return true;
                        return false;
                    },
                },
                { controlType: EnumControltypes.ctDivider, title: 'Texte' },
                { field: 'kurzText', controlType: EnumControltypes.ctHtmlInput },
                { field: 'langText', controlType: EnumControltypes.ctHtmlInput },
                { controlType: EnumControltypes.ctDivider, title: 'Website' },
                { field: 'showOnWebsite', controlType: EnumControltypes.ctOptionInput, values: JaNeinOptionen },
                { field: 'textOnWebsite', controlType: EnumControltypes.ctHtmlInput },



               /* { field: 'datumVonBis', title:'Durchführung von-bis', controlType: EnumControltypes.ctDatespanInput, 
                    enabled: (props:any) => { //{changedValues, allValues, defaultSecurityValue}) => {
                        console.log(props);
                        const { status } = props.allValues;
                        
                        if (status == 'durchgeführt' || status == 'abgerechnet')
                            return false;
                        return true;
                    },
                },
                { field: 'status', controlType: EnumControltypes.ctOptionInput, values: Seminarstati, direction: 'horizontal', defaultValue: 'kunde' },
                { field: 'seminar', controlType: EnumControltypes.ctStringInput },
                { field: 'beschreibung', controlType: EnumControltypes.ctHtmlInput },
                { title: 'Semteil', controlType: EnumControltypes.ctReport, reportId: SeminarteilnehmerBySeminar.reportId },*/
            ]
        },
    },

    actions: {
        ...DefaultAppActions.newDocument(['ADMIN'])
    },

    methods: {
        defaults: async function () {
            //let defaultStartTime = new Date( 2022 , 0 , 1 , 9 , 0 , 0 );
            //defaultStartTime.setHours( 9 , 0 , 0 );
            //let defaultEndTime = new Date();
            //defaultEndTime.setHours( 16 , 0 , 0 );
            return {
                status: EnumMethodResult.STATUS_OKAY,
                defaults: {
                    aktiv: JaNeinEnum.ja,
                    anzahlTage: 1,
                    Tag1VonBis: [
                        new Date( 2022 , 0 , 1 , 9 , 0 , 0 ),
                        new Date( 2022 , 0 , 1 , 15 , 0 , 0 )
                    ],
                    /*Tag2VonBis: [
                        new Date( 2022 , 1 , 1 , 9 , 0 , 0 ),
                        new Date( 2022 , 1 , 1 , 15 , 0 , 0 )
                    ],
                    Tag3VonBis: [
                        defaultStartTime,
                        defaultEndTime
                    ],
                    Tag4VonBis: [
                        defaultStartTime,
                        defaultEndTime
                    ],
                    Tag5VonBis: [
                        defaultStartTime,
                        defaultEndTime
                    ]*/
                }
            }
        },
    },

    dashboardPicker: () => {
        /*if (this.user.roles.has('external')) return 'extern';
        if (this.user.roles.has('gf')) return ['default', 'extern'];*/

        return 'default';
    },
    dashboards: {
        default: {
            rows: [
                {
                    elements: [
                        { _id:'Seminarmodule', width: { xs: 24, sm:24, md:12 },  type: 'report', details: { type: 'table', reportId: 'seminarmodule' } },
                    ]
                },
            ]
        },

        extern: {
            rows: [
                
            ]
        },
    },
})