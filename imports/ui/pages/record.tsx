import React, { useEffect, useState } from 'react';

import { FlowRouter } from 'meteor/kadira:flow-router';
import { MediaQuery, useMediaQueries } from '/client/mediaQueries';

import PageHeader from 'antd/lib/page-header';
import Button from 'antd/lib/button';
import Tag from 'antd/lib/tag';
import Breadcrumb from 'antd/lib/breadcrumb';
import Form from 'antd/lib/form';
import message from 'antd/lib/message';
import notification from 'antd/lib/notification';
import Comment from 'antd/lib/comment';
import Tooltip from 'antd/lib/tooltip';
import Modal from 'antd/lib/modal';
import Input from 'antd/lib/input';
import Space from 'antd/lib/space';
import Statistic from 'antd/lib/statistic';
import Progress from 'antd/lib/progress';
import Divider from 'antd/lib/divider';
import Typography from 'antd/lib/typography';

const { confirm } = Modal;

import StopOutlined from '@ant-design/icons/StopOutlined';

const { useForm } = Form;

import { AppLayout } from '../components/app-layout';
//import { ModalShareWith } from './modals/share-with';

import { useApp, useDocument, useDocumentDefaults, useDocumentLock, useProduct } from '/client/clientdata';

import moment from 'moment';
import { useWhenChanged } from '/imports/api/lib/react-hooks';
import { EnumDocumentModes, EnumFieldTypes, EnumMethodResult } from '/imports/api/consts';
import { Expert } from '../components/expert';
import { isFunction } from '/imports/api/lib/basics';
import { FunctionComponent } from 'react';
import { IProduct, IRunScriptTools, IWorldUser } from '/imports/api/types/world';
import { MethodStatusWrapper } from '../components/method-status';
import { AppData, DefaultAppData, IApp, IAppAction, IGenericInsertResult, IGenericRemoveResult, IGenericUpdateResult, ILockResult } from '/imports/api/types/app-types';
import { Meteor } from 'meteor/meteor';
import { IDocumentLock } from '/imports/api/lib/world';
import { getAppLink, getAppLinkItem } from '/imports/api/lib/helpers';


type TRecordPageProps = {
    params: {
        productId: string,
        appId: string,
        docId: string
    },
    queryParams: { [key:string]:any },
    currentUser: IWorldUser,
    mode: EnumDocumentModes
}

const NewRecord: FunctionComponent<TRecordPageProps> = props => {
    const { params, queryParams } = props;
    const { productId, appId, docId } = params;
    
    const productSubscription = useProduct(productId);
    const appSubscription = useApp(appId);
    const defaultsSubscription = useDocumentDefaults(appSubscription.app, queryParams);

    return <MethodStatusWrapper key={"document-" + docId} subscriptions={[productSubscription, appSubscription, defaultsSubscription]} >
        <Record
            product={productSubscription.product as IProduct}
            app={appSubscription.app as IApp<any>}
            defaults={defaultsSubscription.defaults as DefaultAppData<any>}

            { ...props }
        />

    </MethodStatusWrapper>
}

export const EditShowRecordPage: FunctionComponent<TRecordPageProps> = props => {
    const { params } = props;
    const { productId, appId, docId } = params;
    
    const productSubscription = useProduct(productId);
    const appSubscription = useApp(appId);
    const documentSubscription = useDocument(appId, docId);
    const lockSubscription = useDocumentLock(appId, docId);

    return <MethodStatusWrapper key={"document-" + docId} subscriptions={[productSubscription, appSubscription, documentSubscription, lockSubscription]} >
        <Record
            product={productSubscription.product as IProduct}
            app={appSubscription.app as IApp<any>}
            doc={documentSubscription.doc as AppData<any>}
            lock={lockSubscription.lock as IDocumentLock}

            { ...props }
        />

    </MethodStatusWrapper>
}

export const RecordPage: FunctionComponent<TRecordPageProps> = props => {
    return props.mode == EnumDocumentModes.NEW
        ? <NewRecord { ...props } />
        : <EditShowRecordPage { ...props } />;
    
    /*const { mode, params, queryParams } = props;
    const { productId, appId, docId } = params;
    
    const productSubscription = useProduct(productId);
    const appSubscription = useApp(appId);
    const documentSubscription = useDocument(mode, appId, docId);
    const defaultsSubscription = useDocumentDefaults(mode, appSubscription.app, queryParams);
    const lockSubscription = useDocumentLock(mode, appId, docId);

    return <MethodStatusWrapper key={"document-" + docId} subscriptions={[productSubscription, appSubscription, documentSubscription, lockSubscription, defaultsSubscription]} >
        <Record
            product={productSubscription.product as IProduct}
            app={appSubscription.app as IApp<any>}
            doc={documentSubscription.doc as AppData<any>}
            lock={lockSubscription.lock as IDocumentLock}
            defaults={defaultsSubscription.defaults as DefaultAppData<any>}

            { ...props }
        />

    </MethodStatusWrapper>*/
}

type TRecordProps = {
    product: IProduct,
    app: IApp<any>,
    doc?: AppData<any>,
    lock?: IDocumentLock,
    defaults?: DefaultAppData<any>,
    params: {
        productId: string,
        appId: string,
        docId: string
    },
    queryParams: { [key:string]:any },
    currentUser: IWorldUser,
    mode: EnumDocumentModes,
}
export const Record: FunctionComponent<TRecordProps> = props => {
    const { product, app, doc, lock, defaults, /*queryParams,*/ params, mode, currentUser } = props;
    const { productId, appId, docId } = params;

    //const [ defaults, setDefaults ] = useState<DefaultAppData<any>>();
    const [ recordMode, setRecordMode ] = useState(mode);

    const [ recordForm ] = useForm();
    const { isPhone } = useMediaQueries();

    useEffect(() => {
        let unmounted = false;

        window.scrollTo(0, 0);

        setTimeout( () => {
            if (unmounted) return;

            if (mode == EnumDocumentModes.NEW) {
                recordForm.setFieldsValue(defaults);
            } else {
                Object.keys(app.fields).forEach(f => {
                    const field = app.fields[f];
                    const { type } = field;

                    if (doc && type === EnumFieldTypes.ftYear) {
                        const v = doc[f];
                        if (v) {
                            doc[f] = moment( new Date('01/01/' + v) );
                        }
                    }
                });
                recordForm.setFieldsValue(doc);
            }
        }, 10);

        return () => { unmounted = true };
    }, [])

    const getDocumentRevision = () => {
        if (!doc) return 0;

        return (doc && doc._rev);
    }

    useWhenChanged(getDocumentRevision, () => {
        setTimeout(() => {
            // transform der Year-typen
            // die Date und Datespan-typen werden bereits im useDocument abgehandelt
            if (app && doc) {
                Object.keys(app.fields).forEach(f => {
                    const field = app.fields[f];
                    const { type } = field;

                    if (type === EnumFieldTypes.ftYear) {
                        const v = doc[f];
                        if (v) {
                            doc[f] = moment( new Date('01/01/' + v) );
                        }
                    }
                });

                
                recordForm.setFieldsValue(doc)
                
                /*setTimeout( () => {
                    console.log('setFieldsValue', doc)
                    const setValue = (field:any, value:any) => {
                        recordForm.setFieldsValue({[field]:value});
                    }
                    valuesChangeHooks.forEach(fn => fn(null, doc, setValue));
                }, 1500);*/
            }
        }, 10);
    });

    const saveRecord = () => {
        recordForm.validateFields().then( values => {
            const data = {
                productId,
                appId,
                values
            }
            
            // es müssen alle Date-Werte konvertiert werden, da diese als Funktionsausdruck von moment() vorliegen
            // uns nicht per Metor.call übertragen werden können
            Object.keys(app.fields).forEach(f => {
                const field = app.fields[f];
                const { type } = field;

                if (type === 'Date' || type === 'Datespan') {
                    const v = values[f];
                    if (data.values[f]) {
                        data.values[f] = type === 'Date' ? v.toDate() : [v[0].toDate(), v[1].toDate()]
                    }
                }
                if (type === 'Year') {
                    const v = values[f];
                    if (data.values[f]) {
                        data.values[f] = v.year();
                    }
                }
            });
            
            const meteorCallback = (err: Error | Meteor.Error | undefined, res: IGenericInsertResult | IGenericUpdateResult) => {               
                if (err) {
                    return message.error('Es ist ein unbekannter Systemfehler aufgetreten. Bitte wenden Sie sich an den Systemadministrator.' + err.message);
                }

                const { status, statusText } = res;

                if (status == EnumMethodResult.STATUS_SERVER_EXCEPTION) {
                    message.error('Ein unbekannter Systemfehler ist aufgetreten:\n' + statusText);
                    return;
                }

                if (status == EnumMethodResult.STATUS_ABORT) {
                    message.error(statusText);
                    return;
                }

                /*if (status === 'warning') {
                    message.warning(messageText);
                }

                if (status === 'success') {
                    message.success(messageText);
                }

                if (status === 'info') {
                    message.info(messageText);
                }*/

                if (status == EnumMethodResult.STATUS_OKAY && statusText) {
                    message.success(statusText);
                }
                                
                if (recordMode === 'NEW') {
                    // nach dem Neuzugang können wir auf den konkret gespeicherten Datensatz wechseln
                    FlowRouter.go(`/${productId}/${appId}/${(res as IGenericInsertResult).docId}`);
                } else {
                    // EDIT, UPDATE
                    Meteor.call('__app.' + appId + '.lock', docId, true /*unlock*/, (err: Error, result: ILockResult) => {
                        if (err) {
                            return message.error('Es ist ein unbekannter Systemfehler beim Sperren der Daten aufgetreten. Bitte wenden Sie sich an den Systemadministrator.' + err.message);
                        } else {
                            if (result.status == EnumMethodResult.STATUS_OKAY) {
                                setRecordMode(EnumDocumentModes.SHOW);
                            } else {
                                return message.warning('Es ist ein Fehler beim Entsperren der Daten aufgetreten. ' + result.statusText);
                            }
                        }
                    });
                }
            };
            
            const methodeName = recordMode === 'NEW' ? 'insertDocument' : 'updateDocument';
            let args = [ ];

            if (recordMode === 'EDIT') {
                args.push(docId);
            }
            args.push(data.values);

            Meteor.apply('__app.' + appId + '.' + methodeName, args, meteorCallback as any);

        }).catch(errorInfo => {
            console.log(errorInfo)
            message.error('Es ist ein Fehler beim Speichern der Daten aufgetreten. Bitte überprüfen Sie Ihre Eingaben.');
        });
    }

    const editRecord = () => {
        if (recordMode === 'SHOW') {
            Meteor.call('__app.' + appId + '.lock', docId, (err: Error | undefined, result: ILockResult) => { 
                if (err) {
                    return message.error('Es ist ein unbekannter Systemfehler beim Sperren der Daten aufgetreten. Bitte wenden Sie sich an den Systemadministrator.' + err.message);
                } else {
                    if (result.status == EnumMethodResult.STATUS_OKAY) {
                        setRecordMode(EnumDocumentModes.EDIT);
                    } else {
                        return message.warning('Es ist ein Fehler beim Sperren der Daten aufgetreten. Bitte wenden Sie sich an den Systemadministrator.' + result.statusText);
                    }
                }
            });
        }
    }

    const cancelRecord = () => {
        if (recordMode === 'EDIT' && doc && doc._id) {
            Meteor.call('__app.' + appId + '.lock', docId, true /*unlock*/, (err: Error | undefined, result: ILockResult) => {
                if (err) {
                    return message.error('Es ist ein unbekannter Systemfehler beim Sperren der Daten aufgetreten. Bitte wenden Sie sich an den Systemadministrator.' + err.message);
                } else {
                    if (result.status == EnumMethodResult.STATUS_OKAY) {
                        setRecordMode(EnumDocumentModes.SHOW);
                    } else {
                        return message.warning('Es ist ein Fehler beim Entsperren der Daten aufgetreten.' + result.statusText);
                    }
                }
            });

            // on cancel reset to original saved values
            recordForm.setFieldsValue(doc);
        } else if (recordMode === EnumDocumentModes.NEW) {
            history.back();
        }
    }

    /**
     * Standard implementation of removing the current document
     */
    const removeRecord = () => {
        confirm({
            title: app.namesAndMessages.singular.ohneArtikel + ' löschen?',
            content: <div>Das Löschen von <b>{doc?.title}</b> kann nicht rückgängig gemacht werden!</div>,
            okText: 'Löschen',
            cancelText: 'Abbruch',
            onOk() {
                Meteor.call(`__app.${appId}.removeDocument`, doc?._id, (err: Error | undefined, res: IGenericRemoveResult) => {
                    if (err) {
                        console.error('Fehler beim Löschen des Dokuments aufgetreten.');
                        console.log(err);
                        return message.error('Es ist ein unbekannter Fehler aufgetreten.');
                    }
                    if (res.status == EnumMethodResult.STATUS_OKAY) {
                        message.success(app.namesAndMessages.singular.mitArtikel + ' wurde erfolgreich gelöscht.');
                        return FlowRouter.go(`/${productId}/${appId}/dashboard`);
                    }
                    if (res.status == EnumMethodResult.STATUS_ABORT) {
                        return message.warning(res.statusText);
                    }
                    
                    message.error('Es ist ein Fehler beim Löschen aufgetreten. ' + res.statusText);
                });
            }
        });
    }
    
    let pageButtons: Array<JSX.Element> | undefined = undefined;
    if (recordMode === 'NEW' || recordMode === 'EDIT') {
        pageButtons = [
            <Button key="cancelEdit" className="mbac-app-action-cancel" size={isPhone ? "small":"middle"} style={{marginTop:isPhone?8:0}} onClick={cancelRecord}>Abbruch</Button>,
            <Button key="save" type="primary" className="mbac-app-action-save" size={isPhone ? "small":"middle"} style={{marginTop:isPhone?8:0}} onClick={saveRecord}>Speichern</Button>,
        ]
    } else if ( recordMode === 'SHOW') {        
        if (lock) {
            pageButtons = [
                <Comment key="locked"
                    author={lock.lockedBy.firstName + ' ' + lock.lockedBy.lastName}
                    avatar={<Expert onlyAvatar user={lock.lockedBy}/>}
                    content={
                        <Tag icon={<StopOutlined />} color="error">gesperrt</Tag>
                    }
                    datetime={
                        <Tooltip title={moment(lock.lockedAt).format('DD.MM.YYYY HH:mm')}>
                            <span>{moment(lock.lockedAt).locale('de').fromNow()}</span>
                        </Tooltip>
                    }
                />
            ];
        } else {
            const executeAction = (action: IAppAction<any>) => {
                const { redirect, force, runScript } = action.onExecute;

                if (redirect) FlowRouter.go(redirect);
                if (force && force == 'new') FlowRouter.go(`/${productId}/${appId}/new`);
                if (force && force == 'edit') editRecord();
                if (force && force == 'remove') removeRecord();
                
                const htmlElements = {
                    Space, Tag, Statistic, Progress, Divider, Modal, Input, Form, Typography, Button
                }
                if (runScript) {
                    try {
                        const script = eval(runScript as unknown as string);
                        const tools: IRunScriptTools = {
                            confirm,
                            message,
                            notification,
                            invoke: (name:any, ...args:any[]) => {
                                let callback = (_error:Error, _result:any) => {};
                                if (args && isFunction(args[args.length-1])) {
                                    callback = args.pop()
                                }
                                Meteor.apply('__app.' + name, args, callback as any);
                            },
                            htmlElements,
                            getAppLink,
                            getAppLinkItem
                        }
                        script(doc, tools);

                    } catch(err) {
                        message.error('Es ist ein unbekannter Fehler aufgetreten. Bitte wenden Sie sich an den Administrator.')
                        console.log(err)
                    }
                }
            }

            //let moreActions = [];
            let documentActions = Object.values(app.actions).filter( action => action.environment.find( env => env == 'Document' ));

            documentActions = documentActions.map( action => {
                const { visible } = action;

                if (visible) {
                    try {
                        action.visible = eval(visible as unknown as string);
                        // test visibility
                    } catch(err) {
                        console.log('Fehler beim evaluieren der visibility für eine AppAction', err);
                    }
                } else {
                    action.visible = () => true;
                }

                return action;
            }).filter(action => {
                try {
                    return action.visible && action.visible({ environment:'Document', document: doc as AppData<any> })                    
                } catch(err) {
                    console.error('Fehler beim Prüfen der Sichtbarkeit der AppAction', action.title);
                    console.log(err);
                    return false
                }
            });

            pageButtons = documentActions.map( (action, index) => {
                const { icon, isPrimaryAction, style, className } = action;
                const endStyled = { ...(style||{}), marginTop:isPhone?8:0 };

                let buttonType = 'default';
                if (isPrimaryAction) buttonType = 'primary';

                return (
                    <Button
                        key={index}
                        type={buttonType as any}
                        className={className}
                        style={endStyled}
                        onClick={()=>executeAction(action)}
                        size={isPhone ? "small":"middle"}
                    >
                        { icon ? <i className={icon} style={{marginRight:8}} /> : null }
                        {action.title}
                    </Button>
                );
            });
        }
    } else {
        pageButtons = [];
    }

    let valuesChangeHooks:any[] = []
    const onFieldsChangeHook = (_changedFields:any, _allFields:any) => {
        //console.log('onFieldsChangeHook', changedFields, allFields);
    }

    const registerValuesChangeHook = (fnHook:any) => {
        if (!valuesChangeHooks.find(fn => fn === fnHook))
            valuesChangeHooks.push(fnHook);
    }

    const onValuesChangeHook = (changedValues:any, allValues:any) => {
        const setValue = (field:any, value:any) => {
            recordForm.setFieldsValue({[field]:value});
        }

        valuesChangeHooks.forEach(fn => fn(changedValues, allValues, setValue));
    }

    return <div className="mbac-page mbac-record-page">
        <PageHeader
            className="mbac-page-header"
            title={
                <span><i className={app.icon} style={{fontSize:32, marginRight:16 }}/>{recordMode !== 'NEW' ? doc?.title : 'Neuzugang'}</span>
            }

            subTitle={ isPhone ? undefined : recordMode === 'NEW' ? undefined :
                <MediaQuery showAtTablet showAtDesktop >
                    <span style={{marginTop:8, display:'flex'}}>{`(${app.namesAndMessages.singular.ohneArtikel})`}</span>
                </MediaQuery>
            }

            extra={pageButtons}

            breadcrumb={ isPhone ? undefined :
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <a href="/">Start</a>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        {product.title}
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <a href={`/${productId}/${appId}/dashboard`}>{app.title}</a>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        { mode == EnumDocumentModes.NEW ? 'Neuzugang' : doc?.title }
                    </Breadcrumb.Item>
                </Breadcrumb>
            }
        />
        <div className="mbac-page-content">
            <Form
                layout="horizontal"

                labelCol={{ span: 6 }}
                wrapperCol={{ span: 16 }}
                form={recordForm}

                onFieldsChange={onFieldsChangeHook}
                onValuesChange={onValuesChangeHook}

                preserve={false}
            >
                <AppLayout
                    app={app}

                    defaults={defaults as DefaultAppData<any>}
                    document={doc as AppData<any>}
                    mode={recordMode}
                    
                    onValuesChange={registerValuesChangeHook}

                    currentUser={currentUser}
                />
            </Form>
        </div>
    </div>
}