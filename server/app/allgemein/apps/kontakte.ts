import { FieldNamesAndMessages } from "/imports/api/lib/helpers";
import { defaultSecurityLevel } from "../../security";
import { EnumControltypes, EnumFieldTypes, EnumMethodResult } from "/imports/api/consts";

import { Allgemein } from "/server/app/allgemein";
import { DefaultAppData, IAppLink, IGenericApp, TAppLink, TString } from "/imports/api/types/app-types";
import { Adresse, Adressen } from "./adressen";
import { Anreden } from "./anreden";
import { DefaultAppActions } from "../../defaults";

export interface Kontakt extends IGenericApp {
    anrede: TString;
    nachname: TString;
    vorname: TString;
    telefon: TString;
    email: TString;
    adresse: TAppLink;
}

export const Kontakte = Allgemein.createApp<Kontakt>({
    _id: 'kontakte',
    
    title: "Kontakte",
    description: "Alle Kontakte, die wir als Ansprechpartner, Seminarteilnehmer, etc. benötigen.", 
    icon: 'fa-fw fas fa-user',
    position: 2,
    
    namesAndMessages: {
        singular: { mitArtikel: 'der Kontakt', ohneArtikel: 'Kontakt' },
        plural: { mitArtikel: 'die Kontakte', ohneArtikel: 'Kontakte' },

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
            autoValue: ( ({ allValues: kontakt, injectables }) => {
                const { anrede, vorname, nachname } = kontakt;
                const { Anreden } = injectables;

                const anredeText = Anreden.find( (a: any) => anrede === a._id);

                return (anredeText ? anredeText.title + ' ': '') + (nachname || '') + (vorname ? (', ' + vorname) : '');
            }),
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

        anrede: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie die Anrede an.' },
            ],
            ...FieldNamesAndMessages('die', 'Anrede', 'die', 'Anreden'),
            ...defaultSecurityLevel
        },

        nachname: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie den Nachnamen an.' },    
            ],
            ...FieldNamesAndMessages('der', 'Nachname', 'die', 'Nachnamen', { onUpdate: 'den Nachnamen' }),
            ...defaultSecurityLevel
        },
        vorname: {
            type: EnumFieldTypes.ftString,
            rules: [ ],
            ...FieldNamesAndMessages('der', 'Vorname', 'die', 'Vornamen', { onUpdate: 'den Vornamen' }),
            ...defaultSecurityLevel
        },
        telefon: {
            type: EnumFieldTypes.ftString,
            rules: [ ],
            ...FieldNamesAndMessages('die', 'Telefonnummer', 'die', 'Telefonnummer'),
            ...defaultSecurityLevel
        },
        email: {
            type: EnumFieldTypes.ftString,
            rules: [ ],
            ...FieldNamesAndMessages('die', 'E-Mailadresse', 'die', 'E-Mailadresse'),
            ...defaultSecurityLevel
        },
        adresse: {
            type: EnumFieldTypes.ftAppLink,
            /*appLink: {
                app: 'urlaubskonten',
                hasDescription: true,
                hasImage: false,
                linkable: true
            },*/
            appLink: < IAppLink<Adresse> > {
                app: 'adressen',
                hasDescription: true,
                hasImage: true,
                linkable: true
            },
            rules: [
                { required: true, message: 'Bitte geben Sie die Adresse des Kontakts an.' },
            ],
            ...FieldNamesAndMessages('die', 'Adresse', 'die', 'Adresse'),
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
                { field: 'anrede', controlType: EnumControltypes.ctOptionInput, values: Anreden },
                { field: 'nachname', controlType: EnumControltypes.ctStringInput },
                { field: 'vorname', controlType: EnumControltypes.ctStringInput },
                { field: 'telefon', controlType: EnumControltypes.ctStringInput },
                { field: 'email', controlType: EnumControltypes.ctStringInput },
                { field: 'adresse', controlType: EnumControltypes.ctAppLink },                
            ]
        },
    },

    actions: {
        ...DefaultAppActions.newDocument(['ADMIN', 'EMPLOYEE'], { environment:['Dashboard']}),
        ...DefaultAppActions.editDocument(['ADMIN', 'EMPLOYEE']),
        /*
        neu: {
            isPrimaryAction: true,

            description: 'Neuzugang eines Kontakts',
            icon: 'fas fa-plus',
            
            visibleBy: [ 'ADMIN', 'EMPLOYEE' ],
            executeBy: [ 'ADMIN', 'EMPLOYEE' ],

            onExecute: { redirect: '/allgemein/kontakte/new' }
        },*/
    },

    methods: {
        defaults: async function({ queryParams }) {
            let defaults: DefaultAppData<Kontakt> = {}
        
            if (queryParams && queryParams.adressId) {                
                const adr = Adressen.findOne({ _id: queryParams.adressId }, { fields: { _id:1, title:1, description:1, imageUrl:1 }});
                if (adr) {
                    //defaults.adresse = [{_id: adr._id, title: adr.title, imageUrl: adr.imageUrl, description: adr.description, link: `/allgemein/adressen/${adr._id}`}];
                    defaults.adresse = [{ ...adr, link: `/allgemein/adressen/${adr._id}`}];
                }
            }
        
            return { 
                status: EnumMethodResult.STATUS_OKAY,
                defaults
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

    injectables: {
        Anreden
    }
})