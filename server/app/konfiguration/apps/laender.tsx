import { FieldNamesAndMessages } from "/imports/api/lib/helpers";
import { defaultSecurityLevel, RolesEnum } from "../../security";

import { EnumControltypes, EnumFieldTypes } from "/imports/api/consts";

import { AppData, IGenericApp, TAppLink, UpdateableAppData } from "/imports/api/types/app-types";
import { MebedoWorld } from "../../mebedo-world";
import { getAppStore } from "/imports/api/lib/core";

import { Konfiguration } from "..";
import { Laendergruppe, Laendergruppen } from "./laendergruppen";
import { Adressen } from "../../allgemein/apps/adressen";
import { Projekte } from "../../consulting/apps/projekte";
import { DefaultAppActions, DefaultAppFields, DefaultReportActions } from "../../defaults";
import { AppRuleError } from "/imports/api/lib/error";

export interface Land extends IGenericApp {
    /**
     * Two-Letter-Code für das jeweilige Land
     * z .B. DE für Deutschland, FR für Frankreich
     */
    lc2: string

    /**
     * 3-Letter-Code für das jeweilige Land
     * z .B. DEU für Deutschland, FRA für Frankreich
     */
    lc3: string

    /**
     * Image Url für die Nationalflagge um diese in der
     * DropDown anzuzeigen
     */
    imageUrl: string

    /**
     * Definition zu welcher Ländergruppe
     * EU, Inland, Drittland das jeweilige Land gehört
     */
    laendergruppe: TAppLink
}

export const enum LaenderErrorEnum {
    LAENDERGRUPPE_NOT_FOUND = "LAENDERGRUPPE_NOT_FOUND",
    REF_EXISTS_TO_ADRESSE = "REF_EXISTS_TO_ADRESSE",
    REF_EXISTS_TO_PROJECT_Rechnungsland = "REF_EXISTS_TO_PROJECT_Rechnungsland,",
    REF_EXISTS_TO_PROJECT_Leistungsland = "REF_EXISTS_TO_PROJECT_Leistungsland"
}

export const Laender = Konfiguration.createApp<Land>('laender', {
    title: "Länder",
    description: "Liste aller Länder dieser Welt.",
    icon: 'fa-fw fas fa-globe',
    position: 1,
    
    namesAndMessages: {
        singular: { mitArtikel: 'das Land', ohneArtikel: 'Land' },
        plural: { mitArtikel: 'die Länder', ohneArtikel: 'Länder' },

        // wenn vorhanden, dann wird die Message genutzt - ansonsten wird
        // die Msg generisch mit singular oder plural generiert
        messages: {
            //removeDocument: 'des Landes' // Das Löschen des Landes "Deutschland" kann nicht rückgängig gemacht werden.
        }
    },
    
    sharedWith: [],
    sharedWithRoles: ['ADMIN'],

    fields: {
        ...DefaultAppFields.title(['ADMIN']),
        ...DefaultAppFields.description(['ADMIN']),

        lc2: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { type:'string', min:2, max:2, len:2, required: true, message: 'Bitte geben Sie den 2-Letter-Code ein.' },    
            ],
            ...FieldNamesAndMessages('der', '2-Letter-Code', 'die', '2-Letter-Code`s', { onUpdate: 'den 2-Letter-Code' }),
            ...defaultSecurityLevel
        },

        lc3: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { type:'string', min:3, max:3, len:3, required: true, message: 'Bitte geben Sie den 3-Letter-Code ein.' },    
            ],
            ...FieldNamesAndMessages('der', '3-Letter-Code', 'die', '3-Letter-Code`s', { onUpdate: 'den 3-Letter-Code' }),
            ...defaultSecurityLevel
        },

        imageUrl: {
            type: EnumFieldTypes.ftString, 
            rules: [ ],
            ...FieldNamesAndMessages('die', 'Bildinformation', 'die', 'Bildinformationen' ),
            ...defaultSecurityLevel
        },

        laendergruppe: {
            type: EnumFieldTypes.ftAppLink, 
            appLink: {
                app: 'laendergruppen',
                hasDescription: true,
                hasImage: true,
                linkable: true
            },
            rules: [
                { required: true, message: 'Bitte geben Sie die Ländergruppe an.' },
            ],
            ...FieldNamesAndMessages('die', 'Ländergruppe', 'die', 'Ländergruppen' ),
            ...defaultSecurityLevel
        }
    },

    layouts: {
        default: {
            title: 'Standard-layout',
            description: 'dies ist ein Universallayout für alle Operationen',

            visibleBy: ['EVERYBODY'],
            
            elements: [
                { field: 'title', controlType: EnumControltypes.ctStringInput },
                { field: 'description', title: 'Beschreibung', controlType: EnumControltypes.ctStringInput },
                
                { field: 'lc2', controlType: EnumControltypes.ctStringInput },
                { field: 'lc3', controlType: EnumControltypes.ctStringInput },
                { field: 'imageUrl', controlType: EnumControltypes.ctStringInput },
                { field: 'laendergruppe', controlType: EnumControltypes.ctAppLink },
            ]
        },
    },

    actions: {
        ...DefaultAppActions.newDocument(['ADMIN']),
        ...DefaultAppActions.editDocument(['ADMIN']),
        ...DefaultAppActions.removeDocument(['ADMIN']),
    },

    methods: {},

    dashboardPicker: () => 'default',

    dashboards: {
        default: { 
            rows: [
                {
                    elements: [
                        { _id:'laender-all', width: { xs:24 },  type: 'report', details: { type: 'table', reportId: 'laender-all' } },
                    ]
                },
            ]
        },
    },
});


const ALWAYS = true;

Laender.addRule('share-with-everybody', {
    title: 'Land teilen',
    description: 'Jedes neue Land ist mit Jedermann im System zu teilen.',

    on: 'beforeInsert',
    when: ALWAYS,
    then: async ({ NEW }) => {
        if (!NEW) return;
        NEW.sharedWithRoles = [ RolesEnum.EVERYBODY ];
    }
});

Laender.addRule('remove-land-from-laendergruppe', {
    title: 'Land aus Ländergruppe entfernen',
    description: 'Ändert sich die Ländergruppe, so muss das zuvor eingetragene Land aus der Ländergruppe entfernt werden. Dies gilt auch in dem Falle, dass das Land gelöscht wird.',

    on: [ 'afterUpdate', 'afterRemove' ],
    when: async ({ triggerTiming, hasChanged }) => hasChanged('laendergruppe') || triggerTiming == 'afterRemove',
    then: async ({ _id: landId, OLD, session }) => {   
        const lg = OLD?.laendergruppe[0];
        const laendergruppeOld: AppData<Laendergruppe> = await Laendergruppen.raw().findOne({ _id: lg?._id }, { session });
        
        if (!laendergruppeOld) {
            throw new AppRuleError({
                name: LaenderErrorEnum.LAENDERGRUPPE_NOT_FOUND,
                message: `Die Ländergruppe "${lg?.title}" konnte in Ihrer Beschreibung nicht gefunden werden.`
            });
        }
        let lgDataOld: UpdateableAppData<Laendergruppe> = {};
        lgDataOld.laender = (laendergruppeOld.laender || []).filter( land => land._id != landId );
        
        await Laendergruppen.updateOne(laendergruppeOld._id, { ...lgDataOld }, { session } );
    }
});

Laender.addRule('add-land-to-laendergruppe', {
    title: 'Land zur Ländergruppe hinzufügen',
    description: 'Das Land wird automatisch der hinterlegten Ländergruppe zugeordnet, so dass die Ländergruppe jeweils über alle Länder verfügt, die Ihr angehören.',

    on: ['afterInsert', 'afterUpdate'], 
    when: async ({ hasChanged }) => hasChanged('laendergruppe'),
    then: async ({_id: landId, currentValue, session }) => {
        const lg = currentValue('laendergruppe')[0];
        const laendergruppe: AppData<Laendergruppe> = await Laendergruppen.raw().findOne({_id: lg._id}, { session });
        
        if (!laendergruppe || !landId) {
            throw new AppRuleError({
                name: LaenderErrorEnum.LAENDERGRUPPE_NOT_FOUND, 
                message: `Die Ländergruppe "${lg.title}" konnte in Ihrer Beschreibung nicht gefunden werden.`,
            });
        }

        let lgData: UpdateableAppData<Laendergruppe> = {};
        lgData.laender = laendergruppe.laender || [];

        lgData.laender.push({
            _id: landId,
            title: currentValue('title'),
            description: currentValue('description'),
            imageUrl: currentValue('imageUrl'),
            link: '/konfiguration/laender/' + landId
        });
        
        await Laendergruppen.updateOne(laendergruppe._id, { ...lgData }, { session } );
    }
});

Laender.addRule('remove-land-check-applinks', {
    title: 'Referenzierungen prüfen',
    description: 'Wird das Land gelöscht, so dürfen keine aktiven Referenzierungen mehr vorhanden sein.',

    on: 'afterRemove',
    when: ALWAYS,
    then: async ({ _id }) => {
        if (await Adressen.raw().findOne({'land._id': _id})) {
            throw new AppRuleError({ name: LaenderErrorEnum.REF_EXISTS_TO_ADRESSE, message: `Das Land konnte nicht gelöscht werden, da es noch in einer oder mehrerer Adressen referenziert wird.` });
        }

        if (await Projekte.raw().findOne({'rechnungLand._id': _id})) {
            throw new AppRuleError({ name: LaenderErrorEnum.REF_EXISTS_TO_PROJECT_Rechnungsland, message: `Das Land konnte nicht gelöscht werden, da es noch in einer oder mehrerer Projekte als Rechnungsland referenziert wird.` });
        }

        if (await Projekte.raw().findOne({'leistungsland._id': _id})) {
            throw new AppRuleError( { name: LaenderErrorEnum.REF_EXISTS_TO_PROJECT_Leistungsland, message: `Das Land konnte nicht gelöscht werden, da es noch in einer oder mehrerer Projekte als Leistungsland referenziert wird.` });
        }
    }
});


/**
 * Report zur Darstellung aller Länder im Dashboard
 */
export const ReportLaenderAll = MebedoWorld.createReport<Land, never>('laender-all', {
    title: 'Alle Länder',
    description: 'Zeigt alle Länder dieser Welt.',

    isStatic: false,

    liveDatasource: ({ isServer, publication, currentUser }) => {
        if (isServer && !currentUser) return publication?.ready();
        
        const appStore = isServer ? Laender : getAppStore('laender');
        return appStore.find({}, { sort: { title: 1 } });
    },

    type: 'table',
    tableDetails:{
        columns: [
            {
                title: 'Symbol',
                key: 'imageUrl',
                dataIndex: 'imageUrl',
                render: (imageUrl) => <img src={imageUrl} width="32" height="auto" />
            },
            {
                title: 'Land',
                key: 'title',
                dataIndex: 'title',
    
            },
            {
                title: 'Kurzbeschreibung',
                key: 'description',
                dataIndex: 'description',
            },
            {
                title: '2-LC',
                key: 'lc2',
                dataIndex: 'lc2',
            },
            {
                title: '3-LC',
                key: 'lc3',
                dataIndex: 'lc3',
            },
        ],
    },

    actions: [
        DefaultReportActions.editDocument(['ADMIN'], Laender),
        DefaultReportActions.removeDocument(['ADMIN'], Laender)
    ]
});