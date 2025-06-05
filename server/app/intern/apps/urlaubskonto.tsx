import { FieldNamesAndMessages } from "/imports/api/lib/helpers";
import { defaultSecurityLevel } from "../../security";
import { EnumControltypes, EnumFieldTypes, EnumMethodResult } from "/imports/api/consts";

import { Intern } from "/server/app/intern";
import { AppData, IGenericApp, IGenericRemoveResult, TOptionValues } from "/imports/api/types/app-types";
import { UrlaubskontoAktiv, UrlaubskontoAktivEnum } from "./urlaubskonto-aktiv";
import { UrlaubsanspruchByKonto } from "../reports/urlaubsanspruch-by-konto";
import { MebedoWorld } from "../../mebedo-world";
import { getAppStore } from "/imports/api/lib/core";
import { DefaultAppActions, DefaultReportActions } from "../../defaults";
import { AppRuleError } from "/imports/api/lib/error";
import { FunctionComponent, useState } from "react";
import { Meteor } from "meteor/meteor";
import { Urlaubsanspruch } from "./urlaubsanspruch";
import { Colors } from "/imports/api/colors";

export interface Urlaubskonto extends IGenericApp {
    userId: string
    jahr: number
    aktiv: UrlaubskontoAktivEnum
    anspruch: number
    zusatzAnspruch: number
    verplant: number
    genommen: number
    rest: number
}

const renderUrlaubsstatistik = (fieldValue: number, _doc: AppData<Urlaubskonto>) => {
    const value:number = fieldValue || 0;
    const einheit = value === 1 ? 'Tag':'Tage';

    return <div>
        <span className="theme-color-1">{value}</span><span className="theme-color-0" style={{fontSize:12, marginLeft:16}}>{einheit}</span>
    </div>
}

export const Urlaubskonten = Intern.createApp<Urlaubskonto>('urlaubskonten', {
    title: "Urlaubskonto",
    description: "Verwaltung der Urlaubskonten für alle Mitarbeiter", 
    icon: 'fa-fw fas fa-globe-europe',
    position: 1,
    
    namesAndMessages: {
        singular: { mitArtikel: 'das Urlaubskonto', ohneArtikel: 'Urlaubskonto' },
        plural: { mitArtikel: 'die Urlaubskonten', ohneArtikel: 'Urlaubskonten' },

        // wenn vorhanden, dann wird die Message genutzt - ansonsten wird
        // die Msg generisch mit singular oder plural generiert
        messages: {

        }
    },
    
    sharedWith: [],
    sharedWithRoles: ['EMPLOYEE', 'ADMIN'],

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

        userId: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie den Benutzer an.' },
            ],
            ...FieldNamesAndMessages('der', 'Benutzer', 'die', 'Benutzer', { onUpdate: 'den Benutzer' }),
            ...defaultSecurityLevel
        },
        
        aktiv: {
            type: EnumFieldTypes.ftBoolean,
            rules: [
                { required: true, message: 'Bitte geben Sie an, ob das Konto aktiv ist.' },    
            ],
            ...FieldNamesAndMessages('die', 'Aktivierung', 'die', 'Aktivierung', { onUpdate: 'die Aktivierung' }),
            ...defaultSecurityLevel
        },
        
        jahr: {
            type: EnumFieldTypes.ftYear,
            rules: [
                { required: true, message: 'Bitte geben Sie das Kalenderjahr an.' },
            ],
            ...FieldNamesAndMessages('das', 'Jahr', 'die', 'Jahre'),
            ...defaultSecurityLevel
        },

        anspruch: {
            type: EnumFieldTypes.ftInteger,
            rules: [
                { required: true, message: 'Bitte geben Sie den Gesamtanspruch an.' },
            ],
            ...FieldNamesAndMessages('der', 'Grundanspruch', 'die', 'Grundansprüche', { onUpdate: 'den Grundanspruch' }),
            ...defaultSecurityLevel
        },

        zusatzAnspruch: {
            type: EnumFieldTypes.ftInteger,
            rules: [
                { required: true, message: 'Bitte geben Sie den zusätzlichen Anspruch ein.' },
            ],
            ...FieldNamesAndMessages('der', 'Zusatzanspruch', 'die', 'Zusatzansprüche', { onUpdate: 'den Zusatzanspruch' }),
            ...defaultSecurityLevel
        },

        verplant: {
            type: EnumFieldTypes.ftInteger,
            rules: [],
            ...FieldNamesAndMessages('die', 'verplanten Urlaubstage', 'die', 'verplanten Urlaubstage'),
            ...defaultSecurityLevel
        },

        genommen: {
            type: EnumFieldTypes.ftInteger,
            rules: [],
            ...FieldNamesAndMessages('die', 'bereits genommenen Urlaubstage', 'die', 'bereits genommenen Urlaubstage'),
            ...defaultSecurityLevel
        },

        rest: {
            type: EnumFieldTypes.ftInteger,
            rules: [],
            ...FieldNamesAndMessages('die', 'verbleibenden Urlaubstage', 'die', 'verbleibenden Urlaubstage'),
            ...defaultSecurityLevel
        },
    },

    layouts: {
        default: {
            title: 'Standard-layout',
            description: 'dies ist ein universallayout für alle Operationen',

            visibleBy: ['EMPLOYEE'],
            
            elements: [
                /*{ controlType: EnumControltypes.ctColumns, columns: [
                    { columnDetails: { xs:24, sm:24, md: 16, lg: 16 }, elements: [
                        { field: 'title', controlType: EnumControltypes.ctStringInput },
                        { field: 'description', title: 'Beschreibung', controlType: EnumControltypes.ctStringInput },
                        { field: 'aktiv', title: 'Aktiv', controlType: EnumControltypes.ctOptionInput, values: UrlaubskontoAktiv },
                        { field: 'jahr', controlType: EnumControltypes.ctYearInput },
                        { field: 'anspruch', title: 'Grundanspruch', controlType: EnumControltypes.ctNumberInput },
                    ]},
                    { columnDetails: { xs:11, sm:11, md: 8, lg: 8 }, elements: [
                        { field: 'zusatzAnspruch', title: 'zusätzlicher Anspruch', controlType: EnumControltypes.ctWidgetSimple, icon:'fa fa-hashtag', style:{marginBottom:16}, render: renderUrlaubsstatistik },
                        { field: 'verplant', title: 'verplante Urlaubstage', controlType: EnumControltypes.ctWidgetSimple, icon:'fa fa-hashtag', style:{marginBottom:16}, render: renderUrlaubsstatistik },
                        { field: 'genommen', title: 'bereits genommen', controlType: EnumControltypes.ctWidgetSimple, icon:'fa fa-hashtag', style:{marginBottom:16}, render: renderUrlaubsstatistik },
                        { field: 'rest', title: 'verbleibende Tage', controlType: EnumControltypes.ctWidgetSimple, icon:'fa fa-umbrella-beach', render: renderUrlaubsstatistik },
                    ]},
                ]},*/

                { controlType: EnumControltypes.ctColumns, columns: [
                    { columnDetails: { xs:24, sm:24, md: 16, lg: 16, xl:18, xxl:20 }, elements: [
                        { field: 'title', controlType: EnumControltypes.ctStringInput },
                        { field: 'description', title: 'Beschreibung', controlType: EnumControltypes.ctStringInput },
                        { field: 'aktiv', title: 'Aktiv', controlType: EnumControltypes.ctOptionInput, values: UrlaubskontoAktiv },
                        { field: 'jahr', controlType: EnumControltypes.ctYearInput },
                        { field: 'anspruch', title: 'Grundanspruch', controlType: EnumControltypes.ctNumberInput },
                    ]},
                    { columnDetails: { xs:24, sm:24, md: 8, lg: 8, xl:6, xxl:4 }, elements: [
                        { controlType: EnumControltypes.ctColumns, columns: [
                            { columnDetails: { xs:12, sm:12, md: 12, lg: 24, xl:24, xxl:24 }, elements: [
                                { field: 'zusatzAnspruch', title: 'zusätzlicher Anspruch', controlType: EnumControltypes.ctWidgetSimple, icon:'fa fa-hashtag', style:{marginBottom:16}, render: renderUrlaubsstatistik },
                                { field: 'verplant', title: 'verplante Urlaubstage', controlType: EnumControltypes.ctWidgetSimple, icon:'fa fa-hashtag', style:{marginBottom:16}, render: renderUrlaubsstatistik },
                            ]},
                            { columnDetails: { xs:12, sm:12, md: 12, lg: 24, xl:24, xxl:24 }, elements: [
                                { field: 'genommen', title: 'bereits genommen', controlType: EnumControltypes.ctWidgetSimple, icon:'fa fa-hashtag', style:{marginBottom:16}, render: renderUrlaubsstatistik },
                                { field: 'rest', title: 'verbleibende Tage', controlType: EnumControltypes.ctWidgetSimple, icon:'fa fa-umbrella-beach', style:{}, render: renderUrlaubsstatistik },
                            ]},
                        ]}
                    ]},
                ]},

                { controlType: EnumControltypes.ctReport, reportId: UrlaubsanspruchByKonto.reportId },
            ]
        },
    },

    actions: {
        //...DefaultAppActions.removeDocument(['ADMIN', 'BACKOFFICE'], { environment:['Dashboard']}),
        ...DefaultAppActions.newDocument(['ADMIN', 'BACKOFFICE'], { environment:['Dashboard']}),

        freiFuer: {
            title: 'Antrag Frei für',
            description: 'Antrag auf einen weiteren Tag frei ',

            icon: 'fa fa-umbrella-beach',
            style: { ...Colors.blue },
            isPrimaryAction: false,
            

            environment: ['Document'],

            //visible: ({document}) => document.status == 'beantragt',

            visibleBy: ['ADMIN', 'EMPLOYEE'],
            executeBy: ['ADMIN', 'EMPLOYEE'],

            onExecute: {
                runScript: (doc, tools) => {
                    const { notification, invoke, htmlElements, getAppLink } = tools;
                    const { Modal, Form, Input, Button } = htmlElements;

                    type TFreiFuerProps = {
                        closeDialog: () => void
                    }
                    
                    const FreiFuer: FunctionComponent<TFreiFuerProps> = props => {
                        const [disabled, setDisabled] = useState(false);
                        const { closeDialog } = props;
                    
                        const execute = ({tag, bemerkung}: {tag: string, bemerkung: string}) => {
                            setDisabled(true);

                            let antrag: AppData<Urlaubsanspruch> = {
                                title: 'Frei für den ' + tag,
                                description: '',
                                anzahlTage: 1,
                                status: "beantragt",
                                urlaubskonto: getAppLink(doc, { link: '/intern/urlaubskonten/' } ),
                                bemerkung
                            }

                            invoke('urlaubsansprueche.insertDocument', antrag, (err: Meteor.Error, res: IGenericRemoveResult)=> {
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
                                        message:'Der Antrag auf weiteren Urlaubsanspruch wurde erfolgreich erstellt.',
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
                                    Bitte geben Sie den Tag an, für den Sie einen zusätzichen Urlaubstag erhalten möchten, und begründen Sie diesen.
                                </p>
                    
                                <Form.Item
                                    label="Tag"
                                    name="tag"
                                    rules={[
                                        {required: true, message: 'Bitte geben Sie den Tag an.' },
                                    ]}
                                >
                                    <Input autoFocus />
                                </Form.Item>

                                <Form.Item
                                    label="Begründung"
                                    name="bemerkung"
                                    rules={[
                                        {required: true, message: 'Bitte geben Sie eine Begründung an.' },
                                    ]}
                                >
                                    <Input.TextArea rows={4} />
                                </Form.Item>
                    
                                <div className="mbac-button-container">
                                    <Button type="default" onClick={closeDialog} disabled={disabled}>Abbruch</Button>
                                    <Button type="primary" htmlType="submit" disabled={disabled}>Jetzt beantragen</Button>
                                </div>
                            </Form>        
                        )
                    }

                    const m = Modal.confirm({
                        title: 'Antrag "Frei für"',
                        className: 'mbac-modal-change-password',
                        width: 600,
                        closable: true,
                        okButtonProps: { onClick: () => {}  },
                    });
                
                    m.update({
                        content: <FreiFuer closeDialog={m.destroy} />
                    });
                }
            },
        },

        ...DefaultAppActions.editDocument(['ADMIN', 'BACKOFFICE']),
    },

    methods: { 
        defaults: async () => {
            return { 
                status: EnumMethodResult.STATUS_OKAY,
                defaults: {
                    zusatzAnspruch: 0,
                    verplant: 0,
                    genommen: 0,
                    rest: 0
                }
            }
        }
    },

    dashboardPicker: () => {
        return 'default';
    },
    dashboards: {
        default: { 
            rows: [
                {
                    elements: [
                        { _id:'urlaubskonten-all', width: { xs:24, sm:24, md:24, lg:{offset:2, span:20}, xl:{ offset:5, span:14 }, xxl: { offset:6, span:12 } },  type: 'report', details: { type: 'card', reportId: 'urlaubskonten-all' } },
                    ]
                },
            ]
        },
    },
});

export const ERR_URLAUBSKONTO_NOT_ACTIVE = 'ERR_URLAUBSKONTO_001';
export const ERR_URLAUBSKONTO_REST_LESS_0 = 'ERR_URLAUBSKONTO_002';

Urlaubskonten.addRule('init-konto', {
    title: 'Initialisierung',
    description: 'Das Urlaubskonto wird mit dem Grundanspruch initalisiert, der zugleich der anfängliche Rest an Urlaubstagen darstellt.',
    
    on: ['beforeInsert'], when: true,
    then: async ({ NEW }) => {
        NEW!.rest = NEW!.anspruch;
    }
});

Urlaubskonten.addRule('calc-restanspruch', {
    title: 'Restanspruch berechnen',
    description: 'Ändert sich der Grundanspruch, der zusätzliche Anspruch, der verplante Anteil oder der bereits genommene Anteil des Urlaubskonto, so müssen auch die Resttage neu berechnet werden. Eine Änderung ist nur möglich sofern das Konto noch den Status aktiv hat.',
    
    on: ['beforeUpdate'],
    when: async ({ hasChanged }) => hasChanged('anspruch') || hasChanged('zusatzAnspruch') || hasChanged('verplant') || hasChanged('genommen'),
    then: async ({ NEW, currentValue }) => {
        if (currentValue('aktiv') !== UrlaubskontoAktivEnum.ja) {
            throw new AppRuleError({ name: ERR_URLAUBSKONTO_NOT_ACTIVE, message: `Das Urlaubskonto ist nicht aktiv. Eine Änderung des Restanspruchs kann nicht durchgeführt werden.`})
        }

        NEW!.rest = (currentValue('anspruch') + currentValue('zusatzAnspruch')) - currentValue('verplant') - currentValue('genommen');
    }
});

Urlaubskonten.addRule('check-restanspruch', {
    title: 'Restanspruch prüfen',
    description: 'Der Restanspruch darf nicht kleiner als 0 Tage sein.',
    
    on: ['beforeUpdate'],
    when: async ({ hasChanged, currentValue }) => hasChanged('rest') && currentValue('rest') < 0,
    then: async () => {
        throw new AppRuleError({ name: ERR_URLAUBSKONTO_REST_LESS_0, message: `Der Urlaubsanspruch (Rest) in Tage ist nicht ausreichend.`})
    }
});

/**
 * Report - Alle Urlaubskonten
 */
export const ReportUrlaubskontenAll = MebedoWorld.createReport<Urlaubskonto, any>('urlaubskonten-all', {  
    title: 'Alle Urlaubskonten',
    description: 'Zeigt alle Urlaubskonten.',

    isStatic: false,
    liveDatasource: ({ isServer, publication, currentUser }) => {
        if (isServer && !currentUser) return publication?.ready();
        
        const appStore = isServer ? Urlaubskonten : getAppStore('urlaubskonten');

        return appStore.find({}, { sort: { title: 1 } });
    },
    injectables: {
        UrlaubskontoAktiv
    },
    type: 'card',
    cardDetails: {
        width: { xs:24, sm:24, md:8, lg:8, xl:8, xxl:8 },

        cover: doc => <div style={{fontSize:48}}>{doc.jahr}</div>,
        title: doc => doc.title,
        description: (doc, { Typography, Tag, Progress, Statistic }, injectables) => {
            const UrlaubskontoAktiv: TOptionValues<UrlaubskontoAktivEnum> = injectables!.UrlaubskontoAktiv;
            const { Text } = Typography;
            
            const gesamt = (doc.zusatzAnspruch + doc.anspruch);
            const proz = (1 - (doc.rest / gesamt)) * 100;
            const displayProz = +(Number(proz).toFixed(0));

            const aktiv = UrlaubskontoAktiv.find( a => doc.aktiv == a._id);
            const colorful = { color: aktiv?.color, backgroundColor: aktiv?.backgroundColor, borderColor: aktiv?.color }

            return <div>
                <div>
                    <Text type="secondary">{doc.description}</Text>
                    <Tag style={{...colorful, position:'absolute', top:0, right:0, marginTop:8}}>{aktiv?.title}</Tag>
                </div>
                <div style={{marginTop:16, display:'flex', justifyContent:'space-between'}}>
                    <Statistic title="Anspruch" value={gesamt} valueStyle={{fontSize:20}} suffix="Tage" prefix={<i className="fa fa-fw fa-hashtag" />} />
                    <Statistic title="Rest" value={doc.rest} valueStyle={{fontSize:20, color: doc.rest > 0 ? 'green': 'unset' }}  suffix="Tage" prefix={<i className="fa fa-fw fa-umbrella-beach" />} />
                </div>
                <div style={{marginTop:16, display:'flex', justifyContent:'center', textAlign:'center'}}>
                    <Progress type="circle" percent={displayProz} />
                </div>
            </div>
        }
    },
    
    actions: [
        DefaultReportActions.openDocument(['EVERYBODY'], Urlaubskonten),
        DefaultReportActions.shareDocument(['EVERYBODY'], Urlaubskonten, { type: 'secondary' }),
        DefaultReportActions.removeDocument(['ADMIN'], Urlaubskonten, { type: 'more' })
    ]
});