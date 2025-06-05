import { FieldNamesAndMessages, isOneOf } from "/imports/api/lib/helpers";
import { defaultSecurityLevel } from "../../security";
import { EnumControltypes, EnumFieldTypes, EnumMethodResult } from "/imports/api/consts";

import { DefaultAppData, IAppLink, IGenericApp, TAppLink, UpdateableAppData } from "/imports/api/types/app-types";
import { Consulting } from "..";
import { StatusField } from "../../akademie/apps/seminare";
import { Projektstati } from "./projektstati";
import { Projekt, Projekte } from "./projekte";
import { Aktivitaeten } from "./aktivitaeten";
import { AktivitaetenByTeilprojekte } from "../reports/aktivitaeten-by-teilprojekte";
import { renderSimpleWidgetAufwandMitEinheit } from './projekte';

export interface Teilprojekt extends IGenericApp {
    projekt: TAppLink
    teilprojektname: string
    zeitraum: Array<Date>
    status: string

    /**
     * geplanter Gesamtaufwand für das Projekt in Minuten
     **/
    aufwandPlanMinuten: number
    
    /**
     * Ist-Aufwand, der bereits für das Projekt geleistet wurde in Minuten
     */
    aufwandIstMinuten: number
    
    /**
     * Gesamtaufwand (verbleibend) für das Projekte in Minuten
     */
    aufwandRestMinuten: number
     
    /**
     * geplanter Umsatz
     */
    erloesePlan: number
    
    /**
     * Umsatz, der gebucht wurde jedoch noch nicht fakturiert ist
     */
    erloeseForecast: number
    
    /**
     * fakturierter Umsatz
     */
    erloeseIst: number
    
    /**
     * noch zu fakturierender Umsatz
     */
    erloeseRest: number

    /**
     * Definition der Projektstunden je Beratungstag
     * Diese muss immer für die Berechnung der Tage Plan, Ist und Rest
     * angewandt werden
     */
    stundenProTag: number

    /**
     * Anzeigeeinheit in der die Aufwände in der Anwendung dargestellt werden
     */
    anzeigeeinheit: string
    /**
     * Singular, Plural der Anzeigeeinheit zur Darstellung und der Faktor
     * zur Umrechnung der Aufände auf Minutenbasis zur Anzeigeeinheit
     */
    anzeigeeinheitDetails: { singular: string, plural: string, faktor: number, precision: number }
}


export const Teilprojekte = Consulting.createApp<Teilprojekt>({
    _id: 'teilprojekte',
    
    title: "Teilprojekte",
    description: "Alle Teilprojekte der Consulting", 
    icon: 'fa-fw fas fa-atlas',
    position: 1,
    
    namesAndMessages: {
        singular: { mitArtikel: 'das Teilprojekt', ohneArtikel: 'Teilprojekte' },
        plural: { mitArtikel: 'die Teilprojekte', ohneArtikel: 'Teilprojekte' },

        // wenn vorhanden, dann wird die Message genutzt - ansonsten wird
        // die Msg generisch mit singular oder plural generiert
        messages: {

        }
    },
    
    sharedWith: [],
    sharedWithRoles: ['ADMIN', 'EMPLOYEE'],

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

        projekt: {
            type: EnumFieldTypes.ftAppLink,
            appLink: {
                app: 'projekte', //Projekte,
                hasDescription: true,                
                hasImage: false,
                linkable: true
            } as IAppLink<Projekt>,
            rules: [
                { required: true, message: 'Bitte geben Sie das zugehörige Projekt an.' },
            ],
            ...FieldNamesAndMessages('das', 'Projekt', 'die', 'Projekte'),
            ...defaultSecurityLevel
        },

        teilprojektname: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie den Projektnamen an.' },    
            ],
            ...FieldNamesAndMessages('der', 'Projektname', 'die', 'Projektnamen', { onUpdate: 'den Projektnamen' }),
            ...defaultSecurityLevel
        },

        zeitraum: {
            type: EnumFieldTypes.ftDatespan,
            rules: [
                { required: true, message: 'Bitte geben Sie den Durchführungszeitraum an.' },
            ],
            ...FieldNamesAndMessages('der', 'Zeitraum', 'die', 'Zeiträume', { onUpdate: 'den Zeitraum' } ),
            ...defaultSecurityLevel
        },

        status: StatusField,

        aufwandPlanMinuten: {
            type: EnumFieldTypes.ftInteger,
            rules: [
                { required: true, message: 'Bitte geben Sie den Aufwand (Plan) an.' },
            ],
            ...FieldNamesAndMessages('der', 'Aufwand (Plan)', 'die', 'Aufwände (Plan)', { onUpdate: 'den Aufwand (Plan)' } ),
            ...defaultSecurityLevel
        },
        
        aufwandIstMinuten: {
            type: EnumFieldTypes.ftInteger,
            rules: [ ],
            ...FieldNamesAndMessages('der', 'Aufwand (Ist)', 'die', 'Aufwände (Ist)', { onUpdate: 'den Aufwand (Ist)' } ),
            ...defaultSecurityLevel
        },

        aufwandRestMinuten: {
            type: EnumFieldTypes.ftInteger,
            rules: [ ],
            ...FieldNamesAndMessages('der', 'Aufwand (Rest)', 'die', 'Aufwände (Rest)', { onUpdate: 'den Aufwand (Rest)' } ),
            ...defaultSecurityLevel
        },

        erloesePlan: {
            type: EnumFieldTypes.ftInteger,
            rules: [ 
                { min: 0, message: 'Der geplante Erlös muss immer größer oder gleich 0,00 € sein.' },
                { required: true, message: 'Bitte geben Sie den geplanten Erlös an.' },
            ],
            ...FieldNamesAndMessages('der', 'Erlös (Plan)', 'die', 'Erlöse (Plan)', { onUpdate: 'den Erlös (Plan)' } ),
            ...defaultSecurityLevel
        },

        erloeseIst: {
            type: EnumFieldTypes.ftInteger,
            rules: [ 
                { min: 0, message: 'Der Erlös muss immer größer oder gleich 0,00 sein.' },
                { required: true, message: 'Bitte geben Sie den Erlös an.' },
            ],
            ...FieldNamesAndMessages('der', 'Erlös (Ist)', 'die', 'Erlöse (Ist)', { onUpdate: 'den Erlös (Ist)' } ),
            ...defaultSecurityLevel
        },

        erloeseForecast: {
            type: EnumFieldTypes.ftInteger,
            rules: [ 
                { min: 0, message: 'Der Erlös-Forecast muss immer größer oder gleich 0,00 sein.' },
                { required: true, message: 'Bitte geben Sie den Erlös (Forecast) an.' },
            ],
            ...FieldNamesAndMessages('der', 'Erlös (Forecast)', 'die', 'Erlöse (Forecast)', { onUpdate: 'den Erlös (Forecast)' } ),
            ...defaultSecurityLevel
        },

        erloeseRest: {
            type: EnumFieldTypes.ftInteger,
            rules: [ 
                { min: 0, message: 'Der restliche Erlös muss immer größer oder gleich 0,00 sein.' },
                { required: true, message: 'Bitte geben Sie den verbleibenden Erlös an.' },
            ],
            ...FieldNamesAndMessages('der', 'Erlös (Rest)', 'die', 'Erlöse (Rest)', { onUpdate: 'den Erlös (Rest)' } ),
            ...defaultSecurityLevel
        },

        stundenProTag: {
            type: EnumFieldTypes.ftInteger,
            rules: [ 
                { type:'number', min: 1, message: 'Die minimale Stundenangabe beträgt 1 Stunde.' },
                { type:'number', max: 10, message: 'Die maximale Stunden je Tag betragen 10 Stunden.' },
                { required: true, message: 'Bitte geben Sie die Stunden je Beratertag an.' },
            ],
            ...FieldNamesAndMessages('die', 'Stunden je Beratertag', 'die', 'Stunden je Beratertag' ),
            ...defaultSecurityLevel
        },

        anzeigeeinheit: {
            type: EnumFieldTypes.ftString,
            rules: [ 
                { required: true, message: 'Bitte geben Sie Einheit an, in der die Aufwände angezeigt werden sollen.' },
            ],
            ...FieldNamesAndMessages('die', 'Einheit zur Darstellung der Aufwände', 'die', 'Einheiten zur Darstellung der Aufwände' ),
            ...defaultSecurityLevel
        },
        anzeigeeinheitDetails: {
            type: EnumFieldTypes.ftString,
            rules: [ 
                { required: true, message: 'Bitte geben Sie Details zur Anzeigeeinheit an.' },
            ],
            ...FieldNamesAndMessages('die', 'Details zur Anzeigeeinheit', 'die', 'Details zur Anzeigeeinheit' ),
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
                { field: 'projekt', controlType: EnumControltypes.ctSingleModuleOption },
                { field: 'zeitraum', controlType: EnumControltypes.ctDatespanInput },
                { field: 'status', controlType: EnumControltypes.ctOptionInput, values: Projektstati },
                { controlType: EnumControltypes.ctColumns, columns: [
                    { columnDetails: { xs:24, sm:24, md:8 }, elements: [
                        { field: 'aufwandPlanMinuten', title: 'Gesamtaufwand', controlType: EnumControltypes.ctWidgetSimple, icon:'fas fa-list',
                            render: renderSimpleWidgetAufwandMitEinheit
                        },
                    ]},
                    { columnDetails: { xs:24, sm:24, md:8 }, elements: [
                        { field: 'aufwandIstMinuten', title: 'bereits Verbraucht', controlType: EnumControltypes.ctWidgetSimple, icon:'fas fa-tasks',
                            render: renderSimpleWidgetAufwandMitEinheit
                        },
                    ]},
                    { columnDetails: { xs:24, sm:24, md:8 }, elements: [
                        { field: 'aufwandRestMinuten', title: 'Rest', controlType: EnumControltypes.ctWidgetSimple, icon:'fas fa-list-ul',
                            render: renderSimpleWidgetAufwandMitEinheit
                        },
                    ]}
                ]},
                { controlType: EnumControltypes.ctReport, reportId: AktivitaetenByTeilprojekte.reportId },
            ]
        },
    },

    actions: {
        neu: {
            isPrimaryAction: true,
            
            title: 'Neu',
            description: 'Neuzugang eines Teilprojekt',
            icon: 'fas fa-plus',
            
            environment: ['Dashboard'],

            visibleBy: [ 'ADMIN', 'EMPLOYEE' ],
            executeBy: [ 'ADMIN', 'EMPLOYEE' ],

            onExecute: { redirect: '/consulting/teilprojekte/new' }
        }
    },

    methods: {
        defaults: async function ({ queryParams }) {
            let defaults: DefaultAppData<Teilprojekt> = {
                status: 'angemeldet',

                aufwandPlanMinuten: 0,
                aufwandIstMinuten: 0,
                aufwandRestMinuten: 0,
                erloesePlan: 0,
                erloeseIst: 0,
                erloeseForecast: 0,
                erloeseRest: 0
            }
    
            if (queryParams && queryParams.projektId) {                
                const prj = Projekte.findOne({ _id: queryParams.projektId }, { fields: { _id:1, title:1, description:1, anzeigeeinheitDetails: 1 }});
                if (prj) {
                    defaults.projekt = [{_id:prj._id, title: prj.title, description: prj.description, link: `/consulting/projekte/${prj._id}`}];
                    defaults.anzeigeeinheit = prj.anzeigeeinheit;
                    defaults.anzeigeeinheitDetails = { ...prj.anzeigeeinheitDetails };
                }
            }
        
            return {
                status: EnumMethodResult.STATUS_OKAY,
                defaults
            }
        },

        onBeforeInsert: async function(NEW, { session } ) {
            const prjId = NEW.projekt[0]._id;
            const prj = await Projekte.raw().findOne({ _id: prjId }, { session } );
            if (!prj) {
                return {
                    status: EnumMethodResult.STATUS_ABORT,
                    statustext: `Das Projekt "${NEW.projekt[0].title}" mit der ID "${prjId}" konnte in seiner Beschreibung nicht gefunden werden.`
                }
            }

            NEW.stundenProTag = prj.stundenProTag;
            NEW.anzeigeeinheit = prj.anzeigeeinheit;
            NEW.anzeigeeinheitDetails = prj.anzeigeeinheitDetails;
            
            return { status: EnumMethodResult.STATUS_OKAY };
        },

        onAfterInsert: async function() {
            return { status: EnumMethodResult.STATUS_OKAY };
        },

        onBeforeUpdate: async function(_tpId, NEW, OLD, { hasChanged, currentValue }) {
            if (hasChanged('aufwandPlanMinuten') || hasChanged('aufwandIstMinuten')) {
                NEW.aufwandRestMinuten = currentValue('aufwandPlanMinuten') - currentValue('aufwandIstMinuten');
            }

            if (hasChanged('erloesePlan') || hasChanged('erloeseIst')) {
                NEW.erloeseRest = currentValue('erloesePlan') - currentValue('erloeseIst')
            }
            
            if (hasChanged('status')) {
                if ( OLD.status == 'abgerechnet' ) {
                    return { status: EnumMethodResult.STATUS_ABORT, statusText: `Das Teilprojekt "${OLD.title}" kann nicht abgesagt werden, da es bereits den Status "${OLD.status}" hat und Rechnungen hiezu existieren.` }
                }

                if ( NEW.status == 'abgesagt' && isOneOf(OLD.status, ['bestätigt', 'abgerechnet', 'durchgeführt']) ) {
                    return { status: EnumMethodResult.STATUS_ABORT, statusText: `Das Teilprojekt "${OLD.title}" kann nicht abgesagt werden, da es bereits den Status "${OLD.status}" hat.` }
                }
            }

            return { status: EnumMethodResult.STATUS_OKAY };
        },

        onAfterUpdate: async function (tpId, NEW, OLD, { session, hasChanged }) {
            if (hasChanged('stundenProTag')) {
                // wird die Anzahl der Stunden pro Tag geändert,
                // so muss die Definition in die einzelne AKT nachgetriggert werden
                const akts = await Aktivitaeten.raw().find({ 'teilprojekt._id' : tpId }, { session }).toArray();
                akts.forEach( akt => {
                    Aktivitaeten.updateOne(akt._id, { stundenProTag: NEW.stundenProTag }, { session, skipPermissions: true } );
                });
            }

            if (hasChanged('status')) {
                // wenn das Teilprojekt den Status verändert, soll dieser neue Status auch auf die 
                // darunterliegenden Aktivitäten übertragen werden
                const akts = await Aktivitaeten.raw().find({ 'teilprojekt._id' : tpId }, { session }).toArray();
                
                let i, max: number;
                for(i = 0, max = akts.length; i < max; i++) {
                    const akt = akts[i];
                    
                    const result = await Aktivitaeten.updateOne(akt._id, {
                        status: NEW.status
                    }, { session, skipPermissions: true });

                    if (result.status != EnumMethodResult.STATUS_OKAY) {
                        return result;
                    }
                }
            }

            if (hasChanged('aufwandPlanMinuten') || hasChanged('aufwandIstMinuten') ||
                 hasChanged('erloesePlan') || hasChanged('erloeseIst')) {

                const prjId = OLD.projekt[0]._id;
                const prj = await Projekte.raw().findOne({ _id: prjId }, { session } );
                let prjData: UpdateableAppData<Projekt> = {};

                if (hasChanged('aufwandPlanMinuten')) prjData.aufwandPlanMinuten = prj.aufwandPlanMinuten + NEW.aufwandPlanMinuten - OLD.aufwandPlanMinuten;
                if (hasChanged('aufwandIstMinuten')) prjData.aufwandIstMinuten = prj.aufwandIstMinuten + NEW.aufwandIstMinuten - OLD.aufwandIstMinuten;
                if (hasChanged('erloesePlan')) prjData.erloesePlan = prj.erloesePlan + NEW.erloesePlan - OLD.erloesePlan;
                if (hasChanged('erloeseIst')) prjData.erloeseIst = prj.erloeseIst + NEW.erloeseIst - OLD.erloeseIst;

                if (Object.keys(prjData).length) {
                    await Projekte.updateOne(prjId, prjData, { session });
                }
            }

            return { status: EnumMethodResult.STATUS_OKAY };
        }
    },

    dashboardPicker: () => {
        return 'default';
    },

    dashboards: {
        default: {
            rows: [

            ]
        },

        extern: {
            rows: [
                
            ]
        },
    },
});