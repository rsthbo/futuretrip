import SimpleSchema from 'simpl-schema';

export const UserSchema = new SimpleSchema({
    userId: {
        type: String,
        label: 'Benutzer-ID'
    },
    title: {
        type: String,
        label: 'Titel',
        optional: true
    },
    firstName: {
        type: String,
        max: 100,
        label: 'Vorname'
    },
    lastName: {
        type: String,
        max: 100,
        label: 'Nachname'
    },
    company: {
        type: String,
        label: 'Firma',
        optional: true
    },
    position: {
        type: String,
        label: 'Position',
        optional: true
    },
    qualification: {
        type: String,
        label: 'Qualifikation',
        optional: true
    },
    advancedQualification: {
        type: String,
        label: 'Weiterführende Qualifikation',
        optional: true
    },
});

export const UserWithRoleSchema = new SimpleSchema({
    user: {
        type: UserSchema,
        label: 'Benutzer'
    },
    role: {
        type: String,
        label: 'Benutzerrolle',
        optional: true
    }
});

export const CreationSchema = new SimpleSchema({
    createdAt: {
        type: Date,
        label: 'Erstellt am',
        defaultValue: new Date
    },
    createdBy: {
        type: UserSchema,
        label: 'Erstellt von'
    },
});

export const SharedWithSchema = new SimpleSchema({
    sharedWith: {
        type: Array,
        label: 'Geteilt mit'
    },
    "sharedWith.$": {
        type: UserWithRoleSchema
    },
    
    sharedWithRoles: {
        type: Array,
        label: 'Geteilt mit'
    },
    "sharedWithRoles.$": {
        type: String
    },
});

export const SingularPluralSchema = new SimpleSchema({
    mitArtikel: {
        type: String
    },
    ohneArtikel: {
        type: String
    },
});

export const ProductSchema = new SimpleSchema({
    _id: {
        type: String,
    },
    title: {
        type: String,
        label: 'Titel',
        max: 100,
    },
    description: {
        type: String,
        label: 'Beschreibung'
    },
    position: {
        type: SimpleSchema.Integer,
        label: 'Anzeigeposition'
    },
    icon: {
        type: String,
        label: 'Symbol',
        optional: true
    },
    apps:{
        type: Array,
        defaultValue: []
    },
    'apps.$': {
        type: new SimpleSchema({
            _id: { type: String },
            title: { type: String },
            icon: { type: String },
            position: { type: SimpleSchema.Integer },
        })
    }
});
ProductSchema.extend(SharedWithSchema);

export const AppSchema = new SimpleSchema({
    productId: {
        type: String,
        label: 'Produkt-Id',
    },

    _id: {
        type: String
    },
    
    title: {
        type: String,
        label: 'Titel',
        max: 100,
    },
    description: {
        type: String,
        label: 'Beschreibung'
    },
    namesAndMessages: {
        type: new SimpleSchema({

            singular: SingularPluralSchema,
            
            plural: SingularPluralSchema,

            messages: new SimpleSchema({
                activityRecordInserted: {
                    type: String,
                    optional: true
                },
                activityRecordUpdated: {
                    type: String,
                    optional: true
                },
                activityRecordRemoved: {
                    type: String,
                    optional: true
                }
            })
        }),
        label: 'Namen und Meldungstexte'
    },
    position: {
        type: SimpleSchema.Integer,
        label: 'Anzeigeposition'
    },
    icon: {
        type: String,
        label: 'Symbol',
        optional: true
    },
    isSeparator: {
        type: Boolean,
        optional: true
    },
    fields: {
        type: Object,
        label: 'Felder',
        blackbox: true
    },
    actions: {
        type: Object,
        label: 'Aktionen',
        blackbox: true
    },
    layoutFilter: {
        type: String,
        optional: true
    },
    layouts: {
        type: Object,
        label: 'Layouts',
        blackbox: true
    },
    methods: {
        type: new SimpleSchema({
            defaults: {
                type: String,
                label: 'Defaultsdefinition',
                optional: true
            },
            onBeforeInsert: {
                type: String,
                label: 'Before Insert Hook',
                optional: true
            },
            onAfterInsert: {
                type: String,
                label: 'Before Insert Hook',
                optional: true
            },
            onBeforeUpdate: {
                type: String,
                label: 'Before Insert Hook',
                optional: true
            },
            onAfterUpdate: {
                type: String,
                label: 'Before Insert Hook',
                optional: true
            },
            onBeforeRemove: {
                type: String,
                label: 'Before Insert Hook',
                optional: true
            },
            onAfterRemove: {
                type: String,
                label: 'Before Insert Hook',
                optional: true
            }
        }),

        label: 'Methoden',
        optional: true
    },
    dashboardPicker: {
        type: String
    },
    dashboards: {
        type: Object,
        label: 'Dashboards',
        optional: true,
        blackbox: true
    },
    // hier können irgendwelche Arrays abgelegt werden z.B. Anreden, etc. die später wieder genutzt werden können
    injectables: {
        type: Object,
        optional: true,
        blackbox: true
    }
});

AppSchema.extend(SharedWithSchema);


export const AppFieldSchema = new SimpleSchema({
    title: {
        type: String,
        label: 'Feldname',
        optional: true
    },
    type: {
        type: String,
        label: 'Feldtyp'
    },
    appLink: {
        type: new SimpleSchema({
            /*productId: { // wird beim Feldtyp Module benötigt
                type: String,
                label: 'Produkt-Id',
            },*/
            app: { // wird beim Feldtyp Module benötigt
                type: String,
            },
            hasDescription: {
                type: Boolean
            },
            description: { // JS-Funktion zum rendern der description
                type: String,
                optional: true
            },
            hasImage: {
                type: Boolean
            },
            imageUrl: {
                type: String,
                optional: true
            },
            linkable: {
                type: Boolean
            },
            link: {
                type: String,
                optional: true
            }
        }),
        optional: true
    },
    rules: {
        type: Array,
        label: 'Regeln',
        optional: true
    },
    'rules.$': {
        type: Object,
        label: 'Regeldefinition',
        blackbox: true
    },
    visibleBy: {
        type: Array,
        label: 'Sichtbar für'
    },
    'visibleBy.$': {
        type: String
    },
    editableBy: {
        type: Array,
        label: 'Bearbeitbar für'
    },
    'editableBy.$': {
        type: String
    },
    namesAndMessages: {
        type: new SimpleSchema({

            singular: SingularPluralSchema,
            
            plural: SingularPluralSchema,

            messages: new SimpleSchema({
                onUpdate: {
                    type: String,
                    optional: true
                },
            })
        }),
        label: 'Namen und Meldungstexte'
    },
    autoValue: { // funktion, die den Wert errechnet für dieses Feld
        type: String,
        optional: true
    },
    
});


export const AppLayoutElementsSchema = new SimpleSchema({
    field: {
        type: String,
        optional: true
    },
    title: {
        type: String,
        optional: true
    },
    noTitle: { // wenn true gesetzt ist bedeutet dies, dass kein Label im Form dargestellt wird
        type: Boolean,
        optional: true
    },
    controlType: {
        type: String
    },
    enabled: { // Funktion mit Rückgabe true/false, ob ein Control deaktiviert sein soll
        type: String,
        optional: true
    },
    visible: {// Funktion mit Rückgabe true/false, ob ein Control angezeigt wird oder nicht
        type: String,
        optional: true
    },
    onChange: {
        type: String,
        optional: true
    },
    reportId: { // wird genutzt, wenn controltype = ctReport
        type: String,
        optional: true
    },
    direction: {
        type: 'String', // vertical or horizontal für die Darstellung von Radio Buttons
        optional: true
    },
    values: { // Aulistung von z.B: Optionlist values zur Auswahl im Radio oder Select style, etc
        type: Array, //SimpleSchema.oneOf(String, Array),
        optional: true,
        //custom: () => true
    },
    'values.$': {
        type: new SimpleSchema({
            _id: { type: String },
            title: { type: String },
            pluralTitle: { type: String, optional: true },
            color: { type: String, optional: true },
            backgroundColor: { type: String, optional: true },
            icon: { type: String, optional: true },
            options: { type: Object, blackbox: true, optional: true }
        }),
    },
    defaultValue: {
        type: String,
        optional: true
    },
    collapsedByDefault: {
        type: Boolean,
        optional: true
    },
    elements: {
        type: Array,
        optional: true
    },
    'elements.$': {
        type: Object, //LayoutElementsSchema,
        blackbox: true,
        optional: true
    },
    columns: { // für controlType ctColumns zur Darstellung von <Rows> <Cols>1</Cols> <Cols>2</Cols> </Rows>
        type: Array,
        optional: true
    },
    'columns.$': {
        type: Object,
        blackbox: true,
    },
    columnDetails: {
        type: new SimpleSchema({
            xs: { type: SimpleSchema.Integer, optional: true },
            sm: { type: SimpleSchema.Integer, optional: true },
            md: { type: SimpleSchema.Integer, optional: true },
            lg: { type: SimpleSchema.Integer, optional: true },
            xl: { type: SimpleSchema.Integer, optional: true },
        }),
        optional: true
    },
    googleMapDetails: { // wird benötigt bei controltype GoogleMaps
        type: new SimpleSchema({
            location: { type: String } // Funktion, welche den Location-string setzt als return-wert
        }),
        optional: true
    },
    icon: {
        type: 'String',
        optional: true
    },
    color: {
        type: 'String', // vertical or horizontal für die Darstellung von Radio Buttons
        optional: true
    },
    backgroundColor: {
        type: 'String', // vertical or horizontal für die Darstellung von Radio Buttons
        optional: true
    },
    render: {
        type: 'String', // ind. renderfunction zur client-rendering von gewissen Anzeigen z.B. SimpleWidget
        optional: true
    },
    maxItems: { // max Anzahl auszuwählender Einträge in dem alyouttype AppLink
        type: SimpleSchema.Integer,
        optional: true
    },
    sliderDetails: {
        type: Object,
        blackbox: true,
        optional: true
    },
    style: {
        type: Object,
        blackbox: true,
        optional: true
    },
    htmlElementDetails: {
        type: Object,
        blackbox: true,
        optional: true
    },
});


export const AppLayoutSchema = new SimpleSchema({
    title: {
        type: String,
        label: 'Layouttitel',
        optional: true
    },
    description: {
        type: String,
        label: 'Beschreibung'
    },
    elements: {
        type: Array,
        label: 'Elementauflistung',
    },
    'elements.$': {
        type: AppLayoutElementsSchema
    },
    visibleBy: {
        type: Array,
    },
    'visibleBy.$': {
        type: String,
    }
});

export const AppActionSchema = new SimpleSchema({
    title: {
        type: String,
        label: 'Feldname',
        optional: true
    },
    description: {
        type: String,
        label: 'Feldname',
        optional: true
    },
    icon: {
        type: String,
        label: 'Symbol'
    },
    className: {
        type: String,
        optional: true
    },
    style: {
        type: Object,
        blackbox: true,
        optional: true
    },
    isPrimaryAction: {
        type: Boolean,
        label: 'Kennung der Primäraktion',
        optional: true
    },
    onExecute: {
        type: Object
    },
    'onExecute.redirect': {
        type: String,
        optional: true
    },
    'onExecute.force': {
        type: String, // new, edit, remove
        optional: true
    },
    'onExecute.runScript': {
        type: String,
        optional: true
    },
    visible:{
        type: String,
        optional: true
    },
    visibleBy: {
        type: Array,
        label: 'Sichtbar für'
    },
    'visibleBy.$': {
        type: String
    },
    executeBy: {
        type: Array,
        label: 'Ausführbar durch'
    },
    'executeBy.$': {
        type: String
    },

    environment: {
        type: Array,
        defaultValue: ['Document'],
        optional: true
    },
    'environment.$': {
        type: String
    },
});


export const ReportSchema = new SimpleSchema({
    _id: {
        type: String
    },
    title: {
        type: String,
        label: 'Titel',
        max: 100,
    },
    description: {
        type: String,
        label: 'Beschreibung'
    },
    icon: {
        type: String,
        label: 'Symbol',
        optional: true
    },
    tableDetails: {
        type: new SimpleSchema({
            noHeader: {
                type: Boolean,
                optional: true
            },

            nestedReportId: {
                type: String,
                optional: true
            },

            columns: {
                type: Array,
                optional: true,
            },
            'columns.$': {
                type: new SimpleSchema({
                    title: { type: String },
                    key: { type: String, optional: true },
                    dataIndex: { type: String, optional: true },
                    render: { type: String, optional: true },
                    align: { type: String, optional: true },
                    children: { type: Array, blackbox: true, optional: true },
                    'children.$': { type: Object, blackbox: true, optional: true }
                })
            },
        }),
        optional: true
    },
    cardDetails: {
        type: new SimpleSchema({
            width: {
                type: Object,
                blackbox: true
            },
            title: { type: String },
            description: { type: String },
            avatar: { type: String, optional: true },
            cover: { type: String, optional: true },
        }),
        optional: true
    },
    chartDetails: {
        type: new SimpleSchema({
            chartType: { type: String }
        }),
        optional: true
    },
    staticDatasource: { // datasource für static reports
        type: String,
        optional: true
    },
    liveDatasource: { // datasource für realtime
        type: String,
        optional: true
    },
    isStatic: {
        type: Boolean,
        defaultValue: true,
        optional: true
    },
    injectables: {
        type: Object,
        optional: true,
        blackbox: true
    },
    type: {
        type: String,
        optional: true
    },
    /*chartType: {
        type: String,
        optional: true
    },*/
    actions: {
        type: Array,
        optional: true
    },
    'actions.$': {
        type: new SimpleSchema({
            title: {
                type: String,
                label: 'Titel',
                max: 100,
            },
            description: {
                type: String,
                label: 'Beschreibung'
            },
            icon: {
                type: String,
                label: 'Symbol',
                optional: true
            },
            iconOnly: { // wenn true, dann wird nur das Icon ohne title angezeigt
                type: Boolean,
                defaultValue: false
            },
            inGeneral: { 
                // gibt an, ob die Action z.B. Neuzugang als alg. Aktion überhalb des Reports dargestelt wird
                // oder für jeden einzelnen Datensatz angeboten wird
                type: Boolean,
                defaultValue: false
            },
            type: {
                // gibt an, ob dies die "Haut"Aktion ist. Diese wird im rendering direkt dargestellt und hervorgehben
                type: String, // primary, secondary, more
                defaultValue: 'more'
            },
            visibleAt: {
                type: Array
            },
            'visibleAt.$': {
                type: String
            },
            visibleBy: {
                type: Array
            },
            'visibleBy.$': {
                type: String
            },
            executeBy: {
                type: Array
            },
            'executeBy.$': {
                type: String
            },
            disabled: { // Funktion, die prüft ob die Action deaktiviert werde soll oder nicht
                type: String,
                optional: true
            },
            visible: { // Funktion, die prüft ob die Action angezeigt werde soll oder nicht
                type: String,
                optional: true
            },
            onExecute: {
                type: new SimpleSchema({
                    redirect: {
                        type: String,
                        optional: true
                    },
                    exportToCSV: {
                        type: new SimpleSchema({
                            filename: { type: String }
                        }),
                        optional: true
                    },
                    context: {
                        type: Object,
                        blackbox: true,
                        optional: true
                    },
                    runScript: { // Funktion, die als methode für Server und client registriert wird
                        type: String,
                        optional: true
                    }
                })
            }
        })
    }
});


export const LockSchema = new SimpleSchema({
    appId: { type: String },
    docId: { type: String },
    locked: { type: Boolean },
    lockedBy: {
        type: new SimpleSchema({
            userId: { type: String },
            sessionId: { type: String },
            firstName: { type: String },
            lastName: { type: String }
        })
    },
    lockedAt: { type: Date },
});

export const AnswerSchema = new SimpleSchema({
    message: {
        type: String,
        label: 'Antworttext'
    }
});
AnswerSchema.extend(CreationSchema);

export const ActivitySchema = new SimpleSchema({
    productId: {
        type: String,
        label: 'Produktreferenz'
    },
    appId: {
        type: String,
        label: 'Modulreferenz'
    },
    docId: {
        type: String,
        label: 'Datensatzreferenz'
    },
    type: {
        type: String // USER-POST, SYSTEM-LOG
    },
    action: {
        type: String, // INSERT, UPDATE, REMOVE
        optional: true // only supported if type was SYSTEM-LOG
    },
    message: {
        type: String,
        label: 'Aktivitätsnachricht'
    },
    answers: {
        type: Array,
        label: 'Antworten',
        defaultValue: [],
        optional: true,
    },
    "answers.$": {
        label: 'Antwort',
        type: AnswerSchema
    },
    // is used when "action" == "SYSTEM-LOG"
    changes: {
        type: Array,
        optional: true
    },
    "changes.$": {
        type: Object,
        blackbox: true
    }
});

ActivitySchema.extend(CreationSchema);


export const RoleSchema = new SimpleSchema({
    rolename: {
        type: String,
        label: 'Rollenname'
    },
    description: {
        type: String,
        label: 'Beschreibung'
    },
    selectable: {
        type: Boolean,
        label: 'Auswählbar durch Benutzer',
        defaultValue: true
    },
    score: {
        type: SimpleSchema.Integer, 
        label: 'Wertigkeit der ROlle im Vergleich zu allen anderen Rollen. Je höher der Score desto wertiger die Rolle.',
        defaultValue: 0
    },
    invitableRoles: {
        label: 'Einladbare Rollen',
        type: Array
    },
    'invitableRoles.$': {
        label: 'Einladbare Rolle',
        type: new SimpleSchema({
            roleId: {
                type: String
            },
            displayName: {
                type: String
            }
        })
    },
    permissions: {
        label: 'Berechtigungen',
        type: new SimpleSchema({
            shareWith: {
                type: SimpleSchema.Integer,
                label: 'Darf Dinge teilen',
                defaultValue: 0
            },
            shareWithExplicitRole: {
                type: SimpleSchema.Integer,
                label: 'Darf Dinge mit Benutzern teilen und eine explicite Rolle zuweisen',
                defaultValue: 0
            },
            shareWithOtherRoles: {
                type: SimpleSchema.Integer,
                label: 'Darf Dinge über Rollen teilen',
                defaultValue: 0
            },
            invitableExplicitRoles: {
                label: 'Einladbare explizite Rollen',
                type: Array
            },
            'invitableExplicitRoles.$': {
                label: 'Einladbare explizite Rolle',
                type: new SimpleSchema({
                    roleId: {
                        type: String
                    },
                    displayName: {
                        type: String
                    }
                })
            },
            cancelSharedWith: {
                type: SimpleSchema.Integer,
                label: 'Darf Teilen rückgängig machen bzw. eine Person "entfernen"',
                defaultValue: 0
            },
            cancelSharedWithOtherRoles: {
                type: SimpleSchema.Integer,
                label: 'Darf Teilen rückgängig machen bzw. eine Person "entfernen"',
                defaultValue: 0
            },
            manageUsersAndRoles: {
                type: SimpleSchema.Integer,
                label: 'Darf Benutzer und Rollen verwalten',
                defaultValue: 0
            },
        }),
    }
});