import { FieldNamesAndMessages } from "/imports/api/lib/helpers";
import { defaultSecurityLevel } from "../../security";
import { EnumControltypes, EnumFieldTypes } from "/imports/api/consts";

import { Akademie } from "/server/app/akademie";
import { Seminarstati } from "./seminarstati";
import { IGenericApp } from "/imports/api/types/app-types";
import { DefaultAppActions } from "../../defaults";


export interface Seminar extends IGenericApp {
    seminar: string
    beschreibung: string
    status: string
    datumVonBis: Array<Date>
    maxTeilnehmer: number
}

export const StatusField = {
    type: EnumFieldTypes.ftString,
    rules: [
        { required: true, message: 'Bitte geben Sie den Status an.' },
    ],
    ...FieldNamesAndMessages('der', 'Status', 'die', 'Status', { onUpdate: 'den Status' } ),
    ...defaultSecurityLevel
}

export const Seminare = Akademie.createApp<Seminar>({
    _id: 'seminare',
    
    title: "Seminare",
    description: "Alle Seminare, die von uns angeboten werden.", 
    icon: 'fa-fw fas fa-graduation-cap',
    position: 2,
    
    namesAndMessages: {
        singular: { mitArtikel: 'das Seminar', ohneArtikel: 'Seminar' },
        plural: { mitArtikel: 'die Seminare', ohneArtikel: 'Seminare' },

        // wenn vorhanden, dann wird die Message genutzt - ansonsten wird
        // die Msg generisch mit singular oder plural generiert
        messages: {

        }
    },
    
    sharedWith: [],
    sharedWithRoles: ['EVERYBODY'],

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

        seminar: {
            type: EnumFieldTypes.ftAppLink,
            rules: [
                { required: true, message: 'Bitte geben Sie den Seminartitel ein.' },
            ],
            ...FieldNamesAndMessages('das', 'Seminar', 'die', 'Seminare'),
            ...defaultSecurityLevel
        },

        beschreibung: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { required: true, message: 'Bitte geben Sie eine Seminarbeschreibung ein.' },
            ],
            ...FieldNamesAndMessages('die', 'Beschreibung', 'die', 'Beschreibungen'),
            ...defaultSecurityLevel
        },

        status: StatusField,
        /*status: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie den Status an.' },
            ],
            ...FieldNamesAndMessages('der', 'Status', 'die', 'Status', { onUpdate: 'den Status' } ),
            ...defaultSecurityLevel
        },*/

        datumVonBis: {
            type: EnumFieldTypes.ftDatespan,
            rules: [
                { required: true, message: 'Bitte geben Sie den Durchführungszeitraum an.' },
            ],
            ...FieldNamesAndMessages('der', 'Zeitraum', 'die', 'Zeiträume', { onUpdate: 'den Zeitraum' } ),
            ...defaultSecurityLevel
        },

        maxTeilnehmer: {
            type: EnumFieldTypes.ftInteger,
            rules: [
                { required: true, message: 'Bitte geben Sie maximale Anzahl an Teilnehmern an.' },
            ],
            ...FieldNamesAndMessages('die', 'maximale Teilnehmerzahl', 'die', 'maximale Teilnehmerzahl'),
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
                { field: 'datumVonBis', title:'Durchführung von-bis', controlType: EnumControltypes.ctDatespanInput, 
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
                { title: 'Semteil', controlType: EnumControltypes.ctReport, reportId: 'seminarteilnehmer-by-seminar' },
            ]
        },
    },

    actions: {
        ...DefaultAppActions.newDocument([ 'ADMIN', 'EMPLOYEE' ])
    },

    methods: {
        
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
                        
                    ]
                },
                {
                    elements: [
                        
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