import { FieldNamesAndMessages, getAppLink } from "/imports/api/lib/helpers";
import { defaultSecurityLevel } from "../../security";
import { EnumControltypes, EnumDocumentModes, EnumFieldTypes, EnumMethodResult } from "/imports/api/consts";

import { Intern } from "/server/app/intern";
import { DefaultAppData, IGenericApp, IGenericRemoveResult, TAppLink } from "/imports/api/types/app-types";

import { StatusUrlaubsanspruch, StatusUrlaubsanspruchEnum } from "./status-urlaubsanspruch";
import { Urlaubskonten } from "./urlaubskonto";
import { AppRuleError } from "/imports/api/lib/error";
import { DefaultAppActions, DefaultAppFields } from "../../defaults";
import { Meteor } from "meteor/meteor";
import { FunctionComponent, useState } from "react";

export interface Urlaubsanspruch extends IGenericApp {
    urlaubskonto: TAppLink
    anzahlTage: number
    bemerkung: string
    status: StatusUrlaubsanspruchEnum
    /**
     * Urlaubsanspruch, der genehmigt ist. Ist der Anspruch nur beantragt oder abgelehnt
     * so sind die anazahlTageGenehmigt gleich 0
     */
    anzahlTageGenehmigt: number
    /**
     * Begründung weshalb der Urlaubsanspruch abgelehnt wurde
     */
    grundAblehnung: string
}

export const Urlaubsansprueche = Intern.createApp<Urlaubsanspruch>('urlaubsansprueche', {
    title: "Urlaubsanspruch",
    description: "Urlaubsanspruch aus z.B. 'Frei-für'", 
    icon: 'fa-fw fas fa-plane-departure',
    position: 2,
    
    namesAndMessages: {
        singular: { mitArtikel: 'der Urlaubsanspruch', ohneArtikel: 'Urlaubsanspruch' },
        plural: { mitArtikel: 'die Urlaubsansprüche', ohneArtikel: 'Urlaubsansprüche' },

        // wenn vorhanden, dann wird die Message genutzt - ansonsten wird
        // die Msg generisch mit singular oder plural generiert
        messages: {
            activityRecordInserted: 'hat den Urlaubsanspruch erstellt'
        }
    },
    
    sharedWith: [],
    sharedWithRoles: ['ADMIN'],

    fields: {
        ...DefaultAppFields.title(['ADMIN', 'BACKOFFICE', 'EMPLOYEE']),
        ...DefaultAppFields.description(['ADMIN', 'BACKOFFICE', 'EMPLOYEE']),

        urlaubskonto: {
            type: EnumFieldTypes.ftAppLink,
            appLink: {
                app: 'urlaubskonten',
                hasDescription: true,
                hasImage: false,
                linkable: true
            },
            rules: [
                { required: true, message: 'Bitte geben Sie das entsprechende Urlaubskonto an.' },    
            ],
            ...FieldNamesAndMessages('das', 'Urlaubskonto', 'die', 'Urlaubskonten'),
            ...defaultSecurityLevel
        },

        anzahlTage: {
            type: EnumFieldTypes.ftInteger,
            rules: [
                { required: true, message: 'Bitte geben Sie den Urlaubsanspruch in Tagen ein.' },    
            ],
            ...FieldNamesAndMessages('die', 'Anzahl der Tage', 'die', 'Anzahl der Tage'),
            ...defaultSecurityLevel
        },

        bemerkung: {
            type: EnumFieldTypes.ftString,
            rules: [ ],
            ...FieldNamesAndMessages('die', 'Bemerkung', 'die', 'Bemerkung'),
            ...defaultSecurityLevel
        },

        status: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie den Status an.' },    
            ],
            ...FieldNamesAndMessages('die', 'Status', 'die', 'Stati', { onUpdate: 'den Status' }),
            ...defaultSecurityLevel
        },

        anzahlTageGenehmigt: {
            type: EnumFieldTypes.ftInteger,
            rules: [
                { required: true, message: 'Bitte geben Sie den Urlaubsanspruch in Tagen ein, der genehmigt wurde.' },    
            ],
            ...FieldNamesAndMessages('die', 'Anzahl der genehmigten Tage', 'die', 'Anzahl der genehmigten Tage'),
            ...defaultSecurityLevel
        },

        grundAblehnung: {
            type: EnumFieldTypes.ftString,
            rules: [ ],
            ...FieldNamesAndMessages('die', 'Ablehnungsbegründung', 'die', 'Ablehnungsbegründungen'),
            ...defaultSecurityLevel
        }
    },

    layouts: {
        default: {
            title: 'Standard-layout',
            description: 'dies ist ein universallayout für alle Operationen',

            visibleBy: ['ADMIN', 'EMPLOYEE'],
            
            elements: [
                { field: 'title', controlType: EnumControltypes.ctStringInput },
                { field: 'description', title: 'Beschreibung', controlType: EnumControltypes.ctStringInput },
                { field: 'urlaubskonto', title: 'Urlaubskonto', controlType: EnumControltypes.ctAppLink },
                { field: 'anzahlTage', controlType: EnumControltypes.ctNumberInput },
                { field: 'status', controlType: EnumControltypes.ctOptionInput, values: StatusUrlaubsanspruch },
                { title: 'Grund der Ablehnung', 
                    controlType: EnumControltypes.ctSpacer, 
                    visible: ({ changedValues, allValues, mode }) => mode != EnumDocumentModes.NEW && (changedValues?.status || allValues.status) === 'abgelehnt',
                    elements: [
                        { field: 'grundAblehnung', controlType: EnumControltypes.ctHtmlElement, 
                            htmlElementDetails: { element: 'div', style:{ padding:16, marginBottom:16, border:'1px solid #721c24', borderRadius:2, color:'#721c24', backgroundColor:'#f8d7da' }},
                            visible: ({ changedValues, allValues, mode }) => mode != EnumDocumentModes.NEW && (changedValues?.status || allValues.status) === 'abgelehnt'
                        },
                    ]
                },
                { field: 'bemerkung', controlType: EnumControltypes.ctTextInput },
            ]
        },
    },

    actions: {
        ...DefaultAppActions.editDocument(['ADMIN', 'EMPLOYEE']),
        anspruchGenehmigung: {
            title: 'Genehmigt',
            description: 'Genehmigung des beantragten Urlaubsanspruch',

            icon: 'fas fa-check',
            style:{ color: 'green' },
            isPrimaryAction: false,
            

            environment: ['Document'],

            visible: ({document}) => document.status == 'beantragt',
            visibleBy: ['ADMIN', 'MANAGER'],
            executeBy: ['ADMIN', 'MANAGER'],

            onExecute: {
                runScript: (doc, tools ) => {
                    const { confirm, notification, invoke } = tools;

                    confirm({
                        title: `Urlaubsanspruch genehmigen?`,
                        content: <div>Die Genehmigen von <strong>{doc.title}</strong> kann nicht rückgängig gemacht werden!</div>,
                        onOk: () => {
                            invoke('urlaubsansprueche.updateDocument', doc._id, { status: 'genehmigt' }, (err: Meteor.Error, res: IGenericRemoveResult)=> {
                                if (err) {
                                    console.log(err);
                                    return notification.error({
                                        message: 'Unbekannter Fehler',
                                        description: 'Es ist ein unbekannter Fehler aufgetreten.',
                                    });
                                }
                                if (res.status == EnumMethodResult.STATUS_OKAY) {
                                    return notification.success({
                                        message:'Genehmigt!',
                                        description:`Der Urlaubsanspruch wurde erfolgreich genehmigt.`
                                    });
                                }
                                if (res.status == EnumMethodResult.STATUS_ABORT) {
                                    return notification.warning({
                                        message: res.statusText
                                    });
                                }
                                
                                notification.error({
                                    message: 'Es ist ein Fehler beim Genehmigen aufgetreten. ' + res.statusText
                                });
                            });
                        }
                    });
                }
            },
        },
        anspruchAblehnung: {
            title: 'Abgelehnt',
            description: 'Ablehnung des beantragten Urlaubsanspruch',

            icon: 'fas fa-ban',
            style: { color: 'red' },
            isPrimaryAction: false,
            

            environment: ['Document'],

            visible: ({document}) => document.status == 'beantragt',

            visibleBy: ['ADMIN', 'MANAGER'],
            executeBy: ['ADMIN', 'MANAGER'],

            onExecute: {
                runScript: (doc, tools ) => {
                    const { notification, invoke, htmlElements } = tools;
                    const { Modal, Form, Input, Button } = htmlElements;

                    type TBegruendungProps = {
                        closeDialog: () => void
                    }
                    
                    const Begruendung: FunctionComponent<TBegruendungProps> = props => {
                        const [disabled, setDisabled] = useState(false);
                        const { closeDialog } = props;
                    
                        const execute = ({grundAblehnung}: {grundAblehnung: string}) => {
                            setDisabled(true);
                            
                            invoke('urlaubsansprueche.updateDocument', doc._id, { status: 'abgelehnt', grundAblehnung }, (err: Meteor.Error, res: IGenericRemoveResult)=> {
                                setDisabled(false);
                                if (err) {
                                    console.log(err);
                                    return notification.error({
                                        message: 'Unbekannter Fehler',
                                        description: 'Es ist ein unbekannter Fehler aufgetreten.',
                                    });
                                }
                                if (res.status == EnumMethodResult.STATUS_OKAY) {
                                    notification.success({
                                        message:'Der Urlaubsanspruch wurde erfolgreich abgelehnt.',
                                    });
                                    return closeDialog();
                                }
                                if (res.status == EnumMethodResult.STATUS_ABORT) {
                                    return notification.warning({
                                        message: res.statusText
                                    });
                                }
                                
                                notification.error({
                                    message: 'Es ist ein Fehler beim Genehmigen aufgetreten. ' + res.statusText
                                });
                            });
                        }
                    
                        return (
                            <Form
                                labelCol={{span:8}}
                                wrapperCol={{span:16}}
                                onFinish={execute}
                            >
                                <p className="mbac-intro">
                                    Bitte geben Sie eine Begründung zur Ablehnung des Urlaubsanspruchs ein.
                                </p>
                    
                                <Form.Item
                                    label="Begründung"
                                    name="grundAblehnung"
                                    rules={[
                                        {required: true, message: 'Bitte geben Sie eine Begründung ein.' },
                                    ]}
                                >
                                    <Input.TextArea rows={4} autoFocus />
                                </Form.Item>
                    
                                <div className="mbac-button-container">
                                    <Button type="default" onClick={closeDialog} disabled={disabled}>Abbruch</Button>
                                    <Button type="primary" htmlType="submit" disabled={disabled}>Jetzt Ablehnen</Button>
                                </div>
                            </Form>        
                        )
                    }

                    const m = Modal.confirm({
                        title: 'Urlaubsanspruch ablehnen',
                        className: 'mbac-modal-change-password',
                        width: 600,
                        closable: true,
                        okButtonProps: { onClick: () => {}  },
                    });
                
                    m.update({
                        content: <Begruendung closeDialog={m.destroy} />
                    });
                }
            },
        }
    },

    methods: {
        defaults: async ({ queryParams }) => {
            let defaults: DefaultAppData<Urlaubsanspruch> = {
                status: StatusUrlaubsanspruchEnum.beantrag
            };
            
            if (queryParams && queryParams.urlaubskonto) {
                const konto = Urlaubskonten.findOne({ _id: queryParams.urlaubskonto }, { fields: {_id:1, title:1, description:1}});
                if (konto) {
                    defaults.urlaubskonto = getAppLink(konto, { link: '/intern/urlaubskonten/'});
                }
            }
            
            return { status: EnumMethodResult.STATUS_OKAY, defaults };
        },
    },

    dashboardPicker: () => {
        return 'default';
    },
    dashboards: {
        default: { 
            rows: [
                
            ]
        },
    },
});

export const ERR_URLAUBSANSPRUECHE_CANT_FIND_KONTO = 'ERR_URLAUBSANSPRUECHE_001';
export const ERR_URLAUBSANSPRUECHE_CHANGE_KONTO_FORBIDDEN = 'ERR_URLAUBSANSPRUECHE_002';
export const ERR_URLAUBSANSPRUECHE_DELETE_FORBIDDEN = 'ERR_URLAUBSANSPRUECHE_003';
export const ERR_URLAUBSANSPRUECHE_NO_DIRECT_STORNO = 'ERR_URLAUBSANSPRUECHE_004';
export const ERR_URLAUBSANSPRUECHE_CHANGE_STATUS_FORBIDDEN = 'ERR_URLAUBSANSPRUECHE_005';
export const ERR_URLAUBSANSPRUECHE_CHANGE_TAGE_FORBIDDEN = 'ERR_URLAUBSANSPRUECHE_006';
export const ERR_URLAUBSANSPRUECHE_CHANGE_STATUS_STORNO_FORBIDDEN = 'ERR_URLAUBSANSPRUECHE_007';

Urlaubsansprueche.addRule('check-forbidden-storno-status', {
    title: 'Direkte Stornierung',
    description: 'Ein direkte Anlage eines Stornobelegs ist nicht möglich und darf nur nach entsprechender Genehmigung durchgeführt werden.',
    
    on:['beforeInsert'],
    when: async ({ currentValue}) => currentValue('status') === StatusUrlaubsanspruchEnum.storniert,
    then: async () => {
        throw new AppRuleError({name: ERR_URLAUBSANSPRUECHE_NO_DIRECT_STORNO, message: `Ein direkte Anlage eines Storno ist nicht möglich und darf nur nach entsprechender Genehmigung durchgeführt werden.`})
    }
});

Urlaubsansprueche.addRule('check-forbidden-change-status', {
    title: 'Änderung Status',
    description: 'Ein genehmigter Urlaubsanspruch kann nachträglich nur noch storniert werden. Eine Stornierung kann keinesfalls mehr geändert werden.',
    
    on:['beforeUpdate'],
    when: async ({ hasChanged}) => hasChanged('status'),
    then: async ({ OLD, currentValue}) => {
        const newStatus = currentValue('status');
        const oldStatus = OLD?.status;
        if (oldStatus == StatusUrlaubsanspruchEnum.genehmigt && newStatus !== StatusUrlaubsanspruchEnum.storniert) {
            throw new AppRuleError({name: ERR_URLAUBSANSPRUECHE_CHANGE_STATUS_FORBIDDEN, message: `Der Urlaubsanspruch wurde bereits genehmigt. Es ist nur noch eine Stornierung möglich.`})
        }
        if (oldStatus == StatusUrlaubsanspruchEnum.storniert) {
            throw new AppRuleError({name: ERR_URLAUBSANSPRUECHE_CHANGE_STATUS_STORNO_FORBIDDEN, message: `Der Urlaubsanspruch kann nach der Stornierung nicht mehr geändert werden.`})
        }
    }
});

Urlaubsansprueche.addRule('check-forbidden-change-anzahl-tage', {
    title: 'Änderung Tage',
    description: 'Eine nachträgliche Änderung der anzahl Tage ist nicht möglich, wenn der Urlaubsanspruch bereits genehmigt oder storniert wurde.',
    
    on:['beforeUpdate'],
    when: async ({ OLD, hasChanged }) => hasChanged('anzahlTage') && (OLD?.status === StatusUrlaubsanspruchEnum.genehmigt || OLD?.status === StatusUrlaubsanspruchEnum.storniert),
    then: async () => {
        throw new AppRuleError({name: ERR_URLAUBSANSPRUECHE_CHANGE_TAGE_FORBIDDEN, message: 'Eine nachträgliche Änderung der Anzahl Tage ist nicht möglich.'})
    }
});

Urlaubsansprueche.addRule('check-forbidden-change-urlaubskonto', {
    title: 'Änderung Urlaubskonto',
    description: 'Nach dem der Urlaubsanspruch genehmigt ist darf das Urlaubskonto nicht mehr verändert werden. Sollte versehentlich ein falsches Urlaubskonto ausgewählt worden sein, so muss der Urlaubsanspruch stroniert werden und zum richtigen Konto neu erfasst werden. Damit ist gewährleistet, dass eine richtige entlastung und belastung der Konten erfolgt, die auch nachvollziehbar bleibt.',
    
    on:['beforeUpdate'],
    when: async ({ hasChanged, OLD}) => hasChanged('urlaubskonto') && OLD?.status === StatusUrlaubsanspruchEnum.genehmigt,
    then: async () => {
        throw new AppRuleError({name: ERR_URLAUBSANSPRUECHE_CHANGE_KONTO_FORBIDDEN, message: `Das Urlaubskonto darf nachträglich nicht mehr geändert werden, da der Urlaubsanspruch bereits genehmigt ist.`})
    }
});

Urlaubsansprueche.addRule('genehmigte-urlaubstage', {
    title: 'Genehmigte Urlaubstage',
    description: 'Mit der Genehmigung eines Urlaubsanspruchs wird das Feld "genehmmigte Tage" mit der Anzahl Tage aus dem "Antrag" gefüllt. Ändert sich der Status nachträglich wieder auf beantragt oder abgelehnt, so wird dert Wert "Anzahl genhmigte Tage" wieder auf 0 gesetzt.',

    on:['beforeInsert', 'beforeUpdate'],
    when: async ({ hasChanged }) => hasChanged('status'),
    then: async ({ currentValue, NEW }) => {
        if (currentValue('status') == StatusUrlaubsanspruchEnum.genehmigt) {
            NEW!.anzahlTageGenehmigt = currentValue('anzahlTage')
        } else {
            // ist der Status nicht genehmigt, (im Falle von beantragt oder abgelehnt)
            // so ist die Anzahl immer 0
            NEW!.anzahlTageGenehmigt = 0;
        }
    }
});

Urlaubsansprueche.addRule('storno-urlaubstage', {
    title: 'Storno Urlaubstage',
    description: 'Mit der Stornierung eines Urlaubsanspruchs wird das Feld "Anzahl genhmigte Tage" wieder auf 0 gesetzt. Dies führt dann anschließend zu einer Entlastung des verbundenen Urlaubskontos.',

    on:['beforeUpdate'],
    when: async ({ hasChanged, currentValue }) => hasChanged('status') && currentValue('status') == StatusUrlaubsanspruchEnum.storniert,
    then: async ({ NEW }) => {
        NEW!.anzahlTageGenehmigt = 0;
    }
});

Urlaubsansprueche.addRule('update-konto', {
    title: 'Urlaubskonto aktualisieren',
    description: 'Ändert sich die Anzahl der genehmigten Tage, so muss das zugrundeliegende Urlaubskonto aktualisiert werden und der Zusatzanspruch entsprechend korrigiert werden.',

    on:['afterInsert', 'afterUpdate'],
    when: async ({ hasChanged }) => hasChanged('anzahlTageGenehmigt'),
    then: async ({ currentValue, NEW, OLD, session }) => {
        const kontoId = currentValue('urlaubskonto')[0]._id;
        const kontoTitle = currentValue('urlaubskonto')[0].title;

        const konto = await Urlaubskonten.raw().findOne({ _id: kontoId }, { session });
        if (!konto) {
            throw new AppRuleError({name: ERR_URLAUBSANSPRUECHE_CANT_FIND_KONTO, message: `Das angegeben Urlaubskonto '${kontoTitle} (${kontoId})' konnte in seiner Beschreibung nicht gefunden werden.`})
        }

        await Urlaubskonten.updateOne(kontoId, {
            zusatzAnspruch: konto.zusatzAnspruch + NEW?.anzahlTageGenehmigt - (OLD?.anzahlTageGenehmigt || 0)
        }, { session });
    }
});

Urlaubsansprueche.addRule('anspruch-loeschen', {
    title: 'Urlaubsanspruch Löschen',
    description: 'Das Löschen eines Urlaubsanspruch ist nur möglich solange der Anspruch nicht genehmigt ist.',

    on:['beforeRemove'],
    when: async ({ currentValue }) => currentValue('status') == StatusUrlaubsanspruchEnum.genehmigt,
    then: async () => {
        throw new AppRuleError({name: ERR_URLAUBSANSPRUECHE_DELETE_FORBIDDEN, message: `Der Urlaubsanspruch darf nicht gelöscht werden, da dieser bereits genehmigt wurde und dem Urlaubskonto zugebucht ist.`})
    }
});