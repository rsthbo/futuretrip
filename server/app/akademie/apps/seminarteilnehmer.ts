import { FieldNamesAndMessages } from "/imports/api/lib/helpers";
import { defaultSecurityLevel } from "../../security";
import { EnumControltypes, EnumDocumentModes, EnumFieldTypes, EnumMethodResult } from "/imports/api/consts";

import { Akademie } from "/server/app/akademie";
import { Teilnehmerstati } from './teilnehmerstati';
import { AppData, IAppLink, IAppMethodResult, IAppMethodsDefaultProps, IAutoValueProps, IEnabledProps, IGenericApp, TAppLink, TString } from "/imports/api/types/app-types";
import { Seminar, Seminare } from "./seminare";

import moment from 'moment'
import { getAppStore } from "/imports/api/lib/core";
import { Kontakt, Kontakte } from "../../allgemein/apps/kontakte";


export interface Seminarteilnehmer extends IGenericApp {
    teilnehmer: TAppLink
    seminar: TAppLink;
    status: TString;
}

export const Seminarteilnehmer = Akademie.createApp<Seminarteilnehmer>({
    _id: "seminarteilnehmer",

    title: "Seminarteilnehmer", 
    description: "Alle Seminarteilnehmer, die ein Seminar angeboten oder teilgenommen haben.", 
    icon: 'fa-fw far fa-user',
    position: 3,

    namesAndMessages: {
        singular: { mitArtikel: 'der Seminarteilnehmer', ohneArtikel: 'Seminarteilnehmer' },
        plural: { mitArtikel: 'die Seminareteilnehmer', ohneArtikel: 'Seminarteilnehmer' },

        // wenn vorhanden, dann wird die Message genutzt - ansonsten wird
        // die Msg generisch mit singular oder plural generiert
        messages: {
            activityRecordInserted: 'hat den Teilnehmer angelegt.'
        }
    },
        
    sharedWith: [],
    sharedWithRoles: ['EVERYBODY'],

    fields: {
        title: {
            type:  EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie den Titel ein.' },
            ],
            autoValue: ({ allValues }: IAutoValueProps<Seminarteilnehmer>) => {
                const { teilnehmer } = allValues;
                
                if (teilnehmer && teilnehmer.length) return teilnehmer[0].title;
                
                return '';
            },
            ...FieldNamesAndMessages('der', 'Titel', 'die', 'Titel', { onUpdate: 'den Titel' }),
            ...defaultSecurityLevel
        },

        description: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie eine Beschreibung zum Teilnehmer an.' },
            ],
            autoValue: ({ allValues }) => {
                const { seminar } = allValues;

                if (seminar && seminar.length)
                    return seminar[0].title;
                return '';
            },
            ...FieldNamesAndMessages('die', 'Beschreibung', 'die', 'Beschreibungen'),
            ...defaultSecurityLevel
        },

        seminar: {
            type: EnumFieldTypes.ftAppLink,
            appLink: < IAppLink<Seminar> > {
                app: Seminare,
                hasDescription: true,
                description: (seminar: AppData<Seminar>) => {
                    let datumVon: string = '', 
                        datumBis: string = '',
                        datumsausgabe : string = '';
                    
                    if (seminar.datumVonBis && seminar.datumVonBis[0]) datumVon = moment(seminar.datumVonBis[0]).format('DD.MM.YYYY');
                    if (seminar.datumVonBis && seminar.datumVonBis[1]) datumBis = moment(seminar.datumVonBis[1]).format('DD.MM.YYYY');

                    if (datumVon && !datumBis) datumsausgabe = datumVon;
                    if (datumVon && datumBis && datumVon == datumBis) datumsausgabe = datumVon;
                    if (datumVon && datumBis && datumVon != datumBis) datumsausgabe = datumVon + ' bis ' + datumBis;

                    return datumsausgabe + ' • '  + seminar.status;
                },
                hasImage: false,
                //imageUrl: doc => {
                //    return doc.logoUri;
                //},
                linkable: false
            },
            rules: [
                { required: true, message: 'Bitte geben Sie das Seminar an.' },
            ],
            ...FieldNamesAndMessages('das', 'Seminar', 'die', 'Seminare'),
            ...defaultSecurityLevel
        },

        teilnehmer: {
            type: EnumFieldTypes.ftAppLink,
            appLink: < IAppLink<Kontakt> > {
                app: Kontakte,
                hasDescription: true,
                description: kontakt => {
                    return kontakt.adresse[0].description;
                },
                hasImage: false,
                //imageUrl: kontakt => kontakt.adresse[0].imageUrl,
                linkable: false
            },
            rules: [
                { required: true, message: 'Bitte geben Sie den Teilnehmer an.' },
            ],
            ...FieldNamesAndMessages('der', 'Teilnehmer', 'die', 'Teilnehmer', { onUpdate: 'den Teilnehmer' }),
            ...defaultSecurityLevel
        },

        status: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie den Status an.' },
            ],
            ...FieldNamesAndMessages('der', 'Status', 'die', 'Status', { onUpdate: 'den Status' } ),
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
                { field: 'description', controlType: EnumControltypes.ctStringInput },
                { title: 'Details der Teilnahme', controlType: EnumControltypes.ctDivider },
                { field: 'seminar', controlType: EnumControltypes.ctSingleModuleOption },
                { field: 'teilnehmer', controlType: EnumControltypes.ctSingleModuleOption, enabled: ({ mode }:IEnabledProps) => mode == EnumDocumentModes.NEW },                
                //{ field: 'teilnehmer', controlType: EnumControltypes.ctSingleModuleOption, enabled: ({ mode }:IEnabledProps) => mode == EnumDocumentModes.NEW },                
                { field: 'status', controlType: EnumControltypes.ctOptionInput, values: Teilnehmerstati, direction: 'horizontal', defaultValue: 'bestätigt' },                
            ]
        },
    },

    actions: {
        neu: {
            isPrimaryAction: true,

            description: 'Neuzugang eines Teilnehmers',
            icon: 'fas fa-plus',
            
            visibleBy: [ 'ADMIN', 'EMPLOYEE' ],
            executeBy: [ 'ADMIN', 'EMPLOYEE' ],

            onExecute: { redirect: '/akademie/seminarteilnehmer/new' }
        },
    },

    methods: {
        defaults: ({ queryParams }:IAppMethodsDefaultProps) => {
            let defaults:{ [key:string]: any } = {
                status: 'angemeldet'
            }
    
            if (queryParams && queryParams.seminarId) {
                const Seminare = getAppStore('seminare');

                const seminar = Seminare.findOne({ _id: queryParams.seminarId }, { fields: {_id:1, title:1, description:1}});
                if (seminar) {
                    defaults.seminar = [seminar];
                }
            }
        
            return defaults;
        },
        onBeforeInsert: ({ teilnehmer, seminar }):IAppMethodResult => {            
            // check ob Teilnehmer bereits zu diesem Seminar angemeldet ist
            const Seminarteilnehmer = getAppStore('seminarteilnehmer');
            
            const teilnahme = Seminarteilnehmer.findOne({'teilnehmer._id': teilnehmer[0]._id, 'seminar._id': seminar[0]._id});

            if (teilnahme) {
                return { status: EnumMethodResult.STATUS_ABORT, statusText: 'Der ausgewählte Teilnehmer ist bereits angemeldet.' };
            }

            return { status: EnumMethodResult.STATUS_OKAY };
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
    }
});