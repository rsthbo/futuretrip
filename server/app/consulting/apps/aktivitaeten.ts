import { FieldNamesAndMessages, isOneOf } from "/imports/api/lib/helpers";
import { defaultSecurityLevel } from "../../security";
import { EnumControltypes, EnumFieldTypes, EnumMethodResult } from "/imports/api/consts";

import { AppData, DefaultAppData, IAppLink, IGenericApp, ITriggerTools, TAppLink, UpdateableAppData } from "/imports/api/types/app-types";
import { Consulting } from "..";
import { StatusField } from "../../akademie/apps/seminare";
import { Projektstati } from "./projektstati";
import { Projekt, Projekte } from "./projekte";
import { Teilprojekt, Teilprojekte } from "./teilprojekte";
import { calcMinutes, Einheiten, Rabatteinheiten, RabattEinheitenEnum, TEinheit } from "./einheiten";
import { IMethodStatus } from "/imports/api/types/world";
import { Abrechnungsmethoden, AbrechnungsmethodenEnum } from "./abrechnungsmethoden";
import { DefaultAppActions } from "../../defaults";

export interface Aktivitaet extends IGenericApp {
    projekt: TAppLink
    teilprojekt: TAppLink
    name: string
    nummer: string
    zeitraum: Array<Date>
    status: string
    beschreibung: string

    /**
     * Aufwand Plan gemäß ausgewählter Einheit
     */
    aufwandPlan: number

    /**
     * Ist-Aufwand gemäß ausgewählter Einheit
     */
    aufwandIst: number

    /**
     * Rest-Aufwand gemäß ausgewählter Einheit
     */
    aufwandRest: number

    /**
     * Einheit in der diese Aktivität 'geführt' = Angebote und berechnet werden soll
     */
    einheit: string

    /**
     * Berechneter Plan-Aufwand in Minuten als kleinste Einheit
     */
    aufwandPlanMinuten: number

    /**
     * Berechneter Ist-Aufwand in Minuten als kleinste Einheit
     */
    aufwandIstMinuten: number

    /**
     * Berechneter Rest-Aufwand in Minuten als kleinste Einheit
     */
    aufwandRestMinuten: number

    /**
     * Definition der Projektstunden je Beratungstag
     * Diese muss immer für die Berechnung der Tage Plan, Ist und Rest
     * angewandt werden
     */
    stundenProTag: number

    /**
     * Einzelpreis gemäß ausgewählter Einheit
     */
    einzelpreis: number

    /**
     * Rabattierung des Einzelpreises
     */
    rabatt1: number
    /**
     * Rabatteinheit zur Steuerung ob Prozenz oder
     * fixer Betrag abgezogen werden soll
     */
    rabattEinheit1: RabattEinheitenEnum
    /**
     * Begründung/Erläuterung der Rabattierung
     */
    rabattGrund1: string
    /**
     * Einzelpreis, nach der ersten Rabattierung
     **/
    einzelpreisRabattiert1: number

    /**
     * Rabattierung des Einzelpreises
     */
    rabatt2: number
    /**
     * Rabatteinheit zur Steuerung ob Prozenz oder
     * fixer Betrag abgezogen werden soll
     */
    rabattEinheit2: RabattEinheitenEnum
    /**
     * Begründung/Erläuterung der Rabattierung
     */
    rabattGrund2: string
    
    /**
     * Tatsächlicher Einzelreis, der zur Anwndung kommt
     * abzgl. aller Rabattierungen
     */
    einzelpreisFinal: number

    /**
     * Gesamtbetrag extern, der sich aus dem Aufwand und dem
     * finalen Einzelpreis ergibt
     */
    gesamtpreis: number

    /**
     * Definition wie diese Aktivität abgerechnet werden soll
     */
    abrechnungsmethode: AbrechnungsmethodenEnum
}


declare type TVisibilityByAbrmethode= { [key in keyof Aktivitaet]?: { [ key in AbrechnungsmethodenEnum ]?: boolean }};

const getVisibilityByAbrmethode = (props: any): boolean => {
    const { fieldName, changedValues, allValues }: { fieldName: keyof Aktivitaet, changedValues: AppData<Aktivitaet>, allValues: AppData<Aktivitaet>} = props;
    if (!changedValues && !allValues) return true;

    const hideByAbrechnungsmethode:TVisibilityByAbrmethode = {
        einzelpreis: {
            'ohne Berechnung': false,
            'zum Festpreis': false
        },
        gesamtpreis: {
            "ohne Berechnung": false
        },
        rabatt1: {
            'ohne Berechnung': false,
            'zum Festpreis': false
        },
        rabatt2: {
            'ohne Berechnung': false,
            'zum Festpreis': false
        }
    };
    const fieldPointer = hideByAbrechnungsmethode[fieldName];
    if (!fieldPointer) return true;

    let abrechnungsmethode:AbrechnungsmethodenEnum | null = null;

    if (changedValues && changedValues.abrechnungsmethode) abrechnungsmethode = changedValues.abrechnungsmethode;  
    if (allValues && allValues.abrechnungsmethode) abrechnungsmethode = allValues.abrechnungsmethode;

    if (!abrechnungsmethode) return true;
    
    if (fieldPointer[abrechnungsmethode] === undefined) return true;

    return !!fieldPointer[abrechnungsmethode];
}

/**
 * Prüfung und Berechnung der Rabattierung sowie Gesamtbetrag
 * 
 * @param NEW 
 * @param OLD 
 * @param triggerTools 
 * 
 * @returns OKAY on success ansonsten ABORT mit entsprechender Meldung
 */
const checkAndCalculatePreiseUndRabatte = (
    NEW: AppData<Aktivitaet> | UpdateableAppData<Aktivitaet>, 
    _OLD: AppData<Aktivitaet> | null, 
    triggerTools: ITriggerTools<Aktivitaet>
): IMethodStatus => {
    const { hasChanged, currentValue } = triggerTools;

    // allgemeine Plausprüfungen zur Rabattierung und Gesamtpreis ermittlung
    if (!currentValue('einzelpreis') && (currentValue('rabatt1') || currentValue('rabatt2'))) {
        return { status: EnumMethodResult.STATUS_ABORT, statusText: 'Die Rabattierung kann nicht angewandt werden, da kein Einzelpreis eingetragen wurde.' }
    }
    if (currentValue('rabatt1') && !currentValue('rabattEinheit1')) {
        return { status: EnumMethodResult.STATUS_ABORT, statusText: 'Es wurde keine Rabatteinheit für den ersten Rabatt ausgewählt.' }
    }
    if (currentValue('rabatt2') && !currentValue('rabattEinheit2')) {
        return { status: EnumMethodResult.STATUS_ABORT, statusText: 'Es wurde keine Rabatteinheit für den zweten Rabatt ausgewählt.' }
    }
    if (currentValue('rabatt2') && !currentValue('rabatt1')) {
        return { status: EnumMethodResult.STATUS_ABORT, statusText: 'Es darf kein zweiter Rabatt eingetragen sein, wenn es keinen ersten Rabatt gibt.' }
    }

    // Berechnung des Gesamtbetrags muss immer erfolgen,
    // wenn sich nachfolgende Änderungen vorgenommen wurde:
    if (
        hasChanged('einzelpreis') ||
        hasChanged('rabatt1') ||
        hasChanged('rabattEinheit1') ||
        hasChanged('rabatt2') ||
        hasChanged('rabattEinheit2') ||
        hasChanged('aufwandPlan')
    ) {
        if (currentValue('rabattEinheit1') === RabattEinheitenEnum.prozent) {
            if (currentValue('rabatt1') < 0 || currentValue('rabatt1') > 100) {
                return { status: EnumMethodResult.STATUS_ABORT, statusText: 'Der Prozensatz für den ersten Rabatt muss zwischen 0 und 100 % gewählt werden.' }
            }
        }
        if (currentValue('rabattEinheit2') === RabattEinheitenEnum.prozent) {
            if (currentValue('rabatt2') < 0 || currentValue('rabatt2') > 100) {
                return { status: EnumMethodResult.STATUS_ABORT, statusText: 'Der Prozensatz für den zweiten Rabatt muss zwischen 0 und 100 % gewählt werden.' }
            }
        }

        let einzelpreisRabattiert1 = 0;
        if (currentValue('rabattEinheit1') == RabattEinheitenEnum.betrag) {
            einzelpreisRabattiert1 = currentValue('einzelpreis') - currentValue('rabatt1');
        } else if ( currentValue('rabattEinheit1') == RabattEinheitenEnum.prozent ) {
            einzelpreisRabattiert1 = currentValue('einzelpreis') - (currentValue('einzelpreis') * currentValue('rabatt1') / 100);
        } else {
            // wenn kein rabatt eingetragen, so gilt der unrabattierte Einzelbetrag
            einzelpreisRabattiert1 = currentValue('einzelpreis');
        }
        NEW.einzelpreisRabattiert1 = einzelpreisRabattiert1;
        
        let einzelpreisFinal = 0;
        if (currentValue('rabattEinheit2') == RabattEinheitenEnum.betrag) {
            einzelpreisFinal = einzelpreisRabattiert1 - currentValue('rabatt2');
        } else if ( currentValue('rabattEinheit2') == RabattEinheitenEnum.prozent ) {
            einzelpreisFinal = einzelpreisRabattiert1 - (einzelpreisRabattiert1 * currentValue('rabatt2') / 100);
        } else {
            // wenn kein zweiter Rabatt, so gilt der rabattierte Enzelreis 1
            einzelpreisFinal = einzelpreisRabattiert1;
        }
        NEW.einzelpreisFinal = einzelpreisFinal;

        NEW.gesamtpreis = einzelpreisFinal * currentValue('aufwandPlan');
    }

    // Werte gemäß Abrechnungsmethode Nullen
    switch (currentValue('abrechnungsmethode')) {
        case AbrechnungsmethodenEnum.ohneBerechnung,
            AbrechnungsmethodenEnum.zumFestpreis:
            NEW.einzelpreis = 0;
            NEW.rabatt1 = 0;
            NEW.rabatt2 = 0;
            NEW.einzelpreisRabattiert1 = 0
            NEW.einzelpreisFinal = 0
            NEW.einzelpreisFinal = 0

        case AbrechnungsmethodenEnum.ohneBerechnung:
            NEW.gesamtpreis = 0;

            break;
    }
    
    return { status: EnumMethodResult.STATUS_OKAY }
}

export const Aktivitaeten = Consulting.createApp<Aktivitaet>({
    _id: 'aktivitaeten',
    
    title: "Aktivitaeten",
    description: "Alle Aktivitäten der Consulting", 
    icon: 'fa-fw fas fa-tasks',
    position: 1,
    
    namesAndMessages: {
        singular: { mitArtikel: 'die Aktivität', ohneArtikel: 'Aktivitäten' },
        plural: { mitArtikel: 'die Aktivitäten', ohneArtikel: 'Aktivitäten' },

        // wenn vorhanden, dann wird die Message genutzt - ansonsten wird
        // die Msg generisch mit singular oder plural generiert
        messages: {

        }
    },
    
    sharedWith: [],
    sharedWithRoles: ['EMPLOYEE'],

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
                app: 'projekte',
                hasDescription: true,                
                hasImage: false,
                linkable: true
            } as IAppLink<Projekt>,
            rules: [
                { required: true, message: 'Bitte geben Sie das Projekt an.' },
            ],
            ...FieldNamesAndMessages('das', 'Projekt', 'die', 'Projekte'),
            ...defaultSecurityLevel
        },

        teilprojekt: {
            type: EnumFieldTypes.ftAppLink,
            appLink: {
                app: 'teilprojekte',
                hasDescription: true,                
                hasImage: false,
                linkable: true
            } as IAppLink<Projekt>,
            rules: [
                { required: true, message: 'Bitte geben Sie das Teilprojekt an.' },
            ],
            ...FieldNamesAndMessages('das', 'Teilprojekt', 'die', 'Teilprojekte'),
            ...defaultSecurityLevel
        },

        name: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie den Aktivitätsnamen an.' },    
            ],
            ...FieldNamesAndMessages('der', 'Aktivitätsname', 'die', 'Aktivitätsnamen', { onUpdate: 'den Aktivitätsnamen' }),
            ...defaultSecurityLevel
        },

        nummer: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie die Aktivitätsnummer an.' },    
            ],
            ...FieldNamesAndMessages('der', 'Aktivitätsname', 'die', 'Aktivitätsnamen', { onUpdate: 'den Aktivitätsnamen' }),
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
        
        beschreibung: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { required: true, message: 'Bitte geben Sie eine kurze Beschreibung ein.' },    
            ],
            ...FieldNamesAndMessages('die', 'Beschreibung', 'die', 'Beschreibung'),
            ...defaultSecurityLevel
        },

        aufwandPlan: {
            type: EnumFieldTypes.ftInteger,
            rules: [
                { required: true, message: 'Bitte geben Sie den Aufwand an.' },
            ],
            ...FieldNamesAndMessages('der', 'Aufwand (Plan)', 'die', 'Aufwände', { onUpdate: 'den Aufwand (Plan)' } ),
            ...defaultSecurityLevel
        },
        
        aufwandIst: {
            type: EnumFieldTypes.ftInteger,
            rules: [ ],
            ...FieldNamesAndMessages('der', 'Aufwand (Ist)', 'die', 'Aufwände (Ist)', { onUpdate: 'den Aufwand (Ist)' } ),
            ...defaultSecurityLevel
        },

        aufwandRest: {
            type: EnumFieldTypes.ftInteger,
            rules: [ ],
            ...FieldNamesAndMessages('der', 'Aufwand (Rest)', 'die', 'Aufwände (Rest)', { onUpdate: 'den Aufwand (Rest)' } ),
            ...defaultSecurityLevel
        },

        einheit: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie den Aufwand an.' },
            ],
            ...FieldNamesAndMessages('die', 'Einheit', 'die', 'Einheiten' ),
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

        aufwandPlanMinuten: {
            type: EnumFieldTypes.ftInteger,
            rules: [
                { required: true, message: 'Bitte geben Sie den Aufwand an.' },
            ],
            ...FieldNamesAndMessages('der', 'Aufwand (Plan) in Minuten', 'die', 'Aufwände (Plan) in Minuten', { onUpdate: 'den Aufwand (Plan) in Minuten' } ),
            ...defaultSecurityLevel
        },
        
        aufwandIstMinuten: {
            type: EnumFieldTypes.ftInteger,
            rules: [ ],
            ...FieldNamesAndMessages('der', 'Aufwand (Ist) in Minuten', 'die', 'Aufwände (Ist) in Minuten', { onUpdate: 'den Aufwand (Ist) in Minuten' } ),
            ...defaultSecurityLevel
        },

        aufwandRestMinuten: {
            type: EnumFieldTypes.ftInteger,
            rules: [ ],
            ...FieldNamesAndMessages('der', 'Aufwand (Rest) in Minuten', 'die', 'Aufwände (Rest) in Minuten', { onUpdate: 'den Aufwand (Rest) in Minuten' } ),
            ...defaultSecurityLevel
        },

        einzelpreis: {
            type: EnumFieldTypes.ftDecimal,
            rules: [
                { required: true, message: 'Bitte geben Sie einen Einzelpreis ein.' }
            ],
            ...FieldNamesAndMessages('der', 'Einzelpreis', 'die', 'Einzelpreise', { onUpdate: 'den Einzelpreis' } ),
            ...defaultSecurityLevel
        },

        /**
         * Erster Rabatt
         */
        rabatt1: {
            type: EnumFieldTypes.ftDecimal,
            rules: [],
            ...FieldNamesAndMessages('der', 'erster Rabatt', 'die', 'ersten Rabatte', { onUpdate: 'den ersten Rabatt' } ),
            ...defaultSecurityLevel
        },
        rabattEinheit1: {
            type: EnumFieldTypes.ftString,
            rules: [],
            ...FieldNamesAndMessages('die', 'Rabatteinheit (1)', 'die', 'Rabatteinheiten (1)'),
            ...defaultSecurityLevel
        },
        rabattGrund1: {
            type: EnumFieldTypes.ftString,
            rules: [],
            ...FieldNamesAndMessages('der', 'Rabattgrund (1)', 'die', 'Rabattgründe (1)', { onUpdate: 'den Rabattgrund (1)' } ),
            ...defaultSecurityLevel
        },
        einzelpreisRabattiert1: {
            type: EnumFieldTypes.ftDecimal,
            rules: [],
            ...FieldNamesAndMessages('der', 'Einzelpreis (rabattiert 1)', 'die', 'Einzelpreise (rabattiert 1)', { onUpdate: 'den Einzelpreis (rabattiert 1)' } ),
            ...defaultSecurityLevel
        },

        /**
         * Zweiter Rabatt
         */
        rabatt2: {
            type: EnumFieldTypes.ftDecimal,
            rules: [],
            ...FieldNamesAndMessages('der', 'zweite Rabatt', 'die', 'zweiten Rabatte', { onUpdate: 'den zweiten Rabatt' } ),
            ...defaultSecurityLevel
        },
        rabattEinheit2: {
            type: EnumFieldTypes.ftString,
            rules: [],
            ...FieldNamesAndMessages('die', 'Rabatteinheit (2)', 'die', 'Rabatteinheiten (2)'),
            ...defaultSecurityLevel
        },
        rabattGrund2: {
            type: EnumFieldTypes.ftString,
            rules: [],
            ...FieldNamesAndMessages('der', 'Rabattgrund (2)', 'die', 'Rabattgründe (2)', { onUpdate: 'den Rabattgrund (2)' } ),
            ...defaultSecurityLevel
        },
        einzelpreisFinal: {
            type: EnumFieldTypes.ftDecimal,
            rules: [],
            ...FieldNamesAndMessages('der', 'Einzelpreis (abzgl. Rabattierung)', 'die', 'Einzelpreise (abzgl. Rabattierung)', { onUpdate: 'den Einzelpreis (abzgl. Rabattierung)' } ),
            ...defaultSecurityLevel
        },

        gesamtpreis: {
            type: EnumFieldTypes.ftDecimal,
            rules: [],
            ...FieldNamesAndMessages('der', 'Gesamtpreis (extern)', 'die', 'Gesamtpreise (extern)', { onUpdate: 'den Gesamtpreis (extern)' } ),
            ...defaultSecurityLevel
        },

        abrechnungsmethode: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben an, wie diese Aktivität abgerechnet werden soll.' }
            ],
            ...FieldNamesAndMessages('die', 'Abrechnungsmethode', 'die', 'Abrechnungsmethoden' ),
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
                { field: 'teilprojekt', controlType: EnumControltypes.ctSingleModuleOption },
                { field: 'zeitraum', controlType: EnumControltypes.ctDatespanInput },
                { field: 'status', controlType: EnumControltypes.ctOptionInput, values: Projektstati },
                { field: 'beschreibung', controlType: EnumControltypes.ctHtmlInput },
                
                { title: 'Aufwand', controlType: EnumControltypes.ctSpacer, elements: [
                    { noTitle: true, field: 'aufwandPlan', controlType: EnumControltypes.ctNumberInput },
                    { noTitle: true, field: 'einheit', controlType: EnumControltypes.ctOptionInput, values: Einheiten },
                ]},

                { title: 'Kaufmännische Angaben', controlType: EnumControltypes.ctCollapsible, elements:[
                    { field: 'abrechnungsmethode', controlType: EnumControltypes.ctOptionInput, values: Abrechnungsmethoden },
                    { field: 'einzelpreis', controlType: EnumControltypes.ctCurrencyInput, visible: getVisibilityByAbrmethode },
                    { field: 'gesamtpreis', controlType: EnumControltypes.ctCurrencyInput, enabled: () => false, visible: getVisibilityByAbrmethode },
                    
                    { field: 'rabatt1', title: 'Rabatt 1', controlType: EnumControltypes.ctCollapsible, visible: getVisibilityByAbrmethode, elements: [
                        { title: 'Rabatt 1', controlType: EnumControltypes.ctSpacer, elements: [
                            { noTitle: true, field: 'rabatt1', controlType: EnumControltypes.ctNumberInput },
                            { noTitle: true, field: 'rabattEinheit1', controlType: EnumControltypes.ctOptionInput, values: Rabatteinheiten },
                        ]},
                        { field: 'einzelpreisRabattiert1', controlType: EnumControltypes.ctCurrencyInput, enabled: () => false },
                        { field: 'rabattGrund1', controlType: EnumControltypes.ctHtmlInput },
                    ]},
                    { field: 'rabatt2', title: 'Rabatt 2', controlType: EnumControltypes.ctCollapsible, visible: getVisibilityByAbrmethode, elements: [
                        { field: 'rabatt2', title: 'zweiter Rabatt', controlType: EnumControltypes.ctNumberInput },
                        { field: 'rabattEinheit2', controlType: EnumControltypes.ctOptionInput, values: Rabatteinheiten },
                        { field: 'einzelpreisFinal', controlType: EnumControltypes.ctCurrencyInput, enabled: () => false },
                        { field: 'rabattGrund2', controlType: EnumControltypes.ctHtmlInput },
                    ]},
                ]}
            ]
        },
    },

    actions: {
        ...DefaultAppActions.newDocument([ 'ADMIN', 'EMPLOYEE' ]),
        ...DefaultAppActions.editDocument([ 'ADMIN', 'EMPLOYEE' ]),
    },

    methods: {
        defaults: async function ({ queryParams }) {
            let defaults: DefaultAppData<Aktivitaet> = {
                status: 'geplant',
                
                aufwandIst: 0,
                aufwandPlanMinuten: 0,
                aufwandIstMinuten: 0,
                aufwandRestMinuten: 0
            }
    
            if (queryParams && queryParams.tpId) {                
                const tp = Teilprojekte.findOne({ _id: queryParams.tpId }, { fields: { _id:1, title:1, description:1, projekt:1, status: 1 }});
                if (tp) {
                    defaults.teilprojekt = [{_id:tp._id, title:tp.title, description:tp.description, link:`/consulting/teilprojekte/${tp._id}`}];

                    const prj = Projekte.findOne({ _id: tp.projekt[0]._id }, { fields: { _id:1, title:1, description:1 }});
                    if (prj) {
                        defaults.projekt = [{_id:prj._id, title:prj.title, description:prj.description, link:`/consulting/projekte/${prj._id}`}];
                    }

                    defaults.status = tp.status;
                }
            }
        
            return {
                status: EnumMethodResult.STATUS_OKAY,
                defaults
            };
        },

        onBeforeInsert: async function (NEW, { session, hasChanged, currentValue }) {
            const tpId = NEW.teilprojekt[0]._id;
            const tp = await Teilprojekte.raw().findOne({ _id: tpId }, { session } );
            NEW.stundenProTag = tp.stundenProTag;

            const eingabeEinheit = NEW.einheit;
            const einheit = Einheiten.find( einh => einh._id == eingabeEinheit );
            if (!einheit) {
                return { status: EnumMethodResult.STATUS_ABORT, statusText: `Die Einheit "${eingabeEinheit}" wurde in Ihrer Beschreibung nicht gefunden.` }
            }

            const stdProTag = NEW.stundenProTag;
            NEW.aufwandPlanMinuten = calcMinutes(NEW.aufwandPlan || 0, einheit as TEinheit, stdProTag);            
            
            NEW.aufwandRestMinuten = NEW.aufwandPlanMinuten;
            NEW.aufwandRest = NEW.aufwandPlan;

            const result = checkAndCalculatePreiseUndRabatte(NEW, null, { hasChanged, currentValue });
            if (result.status != EnumMethodResult.STATUS_OKAY) {
                return result;
            }

            return { status: EnumMethodResult.STATUS_OKAY };
        },

        onAfterInsert: async function (_aktId, NEW, { session }) {
            const tpId = NEW.teilprojekt[0]._id;
            const relatedTp = await Teilprojekte.raw().findOne({ _id: tpId }, { session } );
            
            let updateableTpData: UpdateableAppData<Teilprojekt> = {};
            updateableTpData.aufwandPlanMinuten = (relatedTp.aufwandPlanMinuten || 0) + NEW.aufwandPlanMinuten;

            // Erlöse Plan aktualisieren
            updateableTpData.erloesePlan = (relatedTp.erloesePlan || 0) + (NEW.gesamtpreis || 0);
            
            await Teilprojekte.updateOne(tpId, updateableTpData, { session });

            return { status: EnumMethodResult.STATUS_OKAY };
        },

        onBeforeUpdate: async function (_aktId, NEW, OLD, { hasChanged, currentValue }) {
            const recalcMinutes = () => {
                const einheit = Einheiten.find( einh => einh._id == currentValue('einheit') );
                if (!einheit) {
                    return { status: EnumMethodResult.STATUS_ABORT, statusText: `Die Einheit "${currentValue('einheit')}" wurde in Ihrer Beschreibung nicht gefunden.` }
                }

                const stdProTag = currentValue('stundenProTag'); //  NEW.stundenProTag === undefined ? OLD.stundenProTag : NEW.stundenProTag;
                NEW.aufwandPlanMinuten = calcMinutes(currentValue('aufwandPlan'), einheit as TEinheit, stdProTag);
                NEW.aufwandIstMinuten = calcMinutes(currentValue('aufwandIst'), einheit as TEinheit, stdProTag);
                
                NEW.aufwandRestMinuten = NEW.aufwandPlanMinuten - NEW.aufwandIstMinuten;
            }

            if (hasChanged('aufwandPlan') || hasChanged('aufwandIst')) {
                NEW.aufwandRest = currentValue("aufwandPlan") - currentValue('aufwandIst');
            }

            if (hasChanged('aufwandPlan') || hasChanged('aufwandIst') || hasChanged('einheit') || hasChanged('stundenProTag')) {
                recalcMinutes();
            }

            if (hasChanged('status')){
                if (NEW.status == 'abgesagt' && isOneOf(OLD.status, ['bestätigt', 'abgerechnet', 'durchgeführt'])) {
                    return { status: EnumMethodResult.STATUS_ABORT, statusText: `Die Aktivität "${OLD.title}" kann nicht abgesagt werden, da sie bereits den Status "${OLD.status}" aufweist.` }                
                }
            }

            const result = checkAndCalculatePreiseUndRabatte(NEW, OLD, { hasChanged, currentValue });
            if (result.status != EnumMethodResult.STATUS_OKAY) {
                return result;
            }
            
            return { status: EnumMethodResult.STATUS_OKAY };
        },

        onAfterUpdate: async (_aktId, NEW, OLD, { session, hasChanged }) => {           
            const tpId = OLD.teilprojekt[0]._id;
            const relatedTp = await Teilprojekte.raw().findOne({ _id: tpId }, { session } );

            let tpData: UpdateableAppData<Teilprojekt> = {};

            if (hasChanged('aufwandPlanMinuten')) {
                tpData.aufwandPlanMinuten = (relatedTp.aufwandPlanMinuten || 0) + (NEW.aufwandPlanMinuten || 0) - (OLD.aufwandPlanMinuten || 0);
            }
            if (hasChanged('aufwandIstMinuten')) {
                tpData.aufwandIstMinuten = (relatedTp.aufwandIstMinuten || 0) + (NEW.aufwandIstMinuten || 0) - (OLD.aufwandIstMinuten || 0);
            }

            if (hasChanged('gesamtpreis')) {
                tpData.erloesePlan = (relatedTp.erloesePlan || 0) + (NEW.gesamtpreis || 0) - (OLD.gesamtpreis || 0);
            }

            if (Object.keys(tpData).length) {
                await Teilprojekte.updateOne(tpId, tpData, { session });
            }

            return { status: EnumMethodResult.STATUS_OKAY };
        },

        onBeforeRemove: async function ( OLD ) {
            if (OLD.aufwandIst > 0) {
                return { status: EnumMethodResult.STATUS_ABORT, statusText: `Die Aktivität "${OLD.title}" kann nicht gelöscht werden, da bereits Buchungen vorliegen.` }
            }

            if (isOneOf(OLD.status, ['bestätigt', 'abgerechnet', 'durchgeführt'])) {
                return { status: EnumMethodResult.STATUS_ABORT, statusText: `Die Aktivität "${OLD.title}" kann nicht gelöscht werden, da sie bereits den Status "${OLD.status}" aufweist.` }
            }
            return { status: EnumMethodResult.STATUS_OKAY };
        },

        onAfterRemove: async function (OLD, { session }) {
            // das Löschen der Aktivität muss den Gesamtaufwand des Teilprojekts verringern
            const tpId = OLD.teilprojekt[0]._id;
            const relatedTp = await Teilprojekte.raw().findOne({ _id: tpId }, { session } );

            let tpData: UpdateableAppData<Teilprojekt> = {};
            
            tpData.aufwandPlanMinuten = relatedTp.aufwandPlanMinuten - OLD.aufwandPlanMinuten;
            tpData.erloesePlan = relatedTp.erloesePlan - OLD.gesamtpreis;

            if (Object.keys(tpData).length) {
                await Teilprojekte.updateOne(tpId, tpData, { session });
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