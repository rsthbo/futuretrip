import React, { Fragment, FunctionComponent } from 'react';

import PageHeader from 'antd/lib/page-header';
import Button from 'antd/lib/button';
import Breadcrumb from 'antd/lib/breadcrumb';

import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import notification from 'antd/lib/notification';

import { useProduct, useApp } from '/client/clientdata';

import { FlowRouter } from 'meteor/kadira:flow-router';
import { EnumDocumentModes } from '/imports/api/consts';
import { IApp, IAppAction, TAppActions, TAppDashboardElementType } from '/imports/api/types/app-types';
import { ReportControl } from '../components/layout-controls/report';
import { IProduct, IWorldUser } from '/imports/api/types/world';
import { IGenericDocument } from '/imports/api/lib/core';
import { MethodStatusWrapper } from '../components/method-status';
import { useEffect } from 'react';
import { useMediaQueries } from '/client/mediaQueries';

type TAppDashboardPageProps = {
    currentUser: IWorldUser
    params: {
        productId: string
        appId: string
    }
}
export const AppDashboardPage: FunctionComponent<TAppDashboardPageProps> = props => {
    const { productId, appId } = props.params;
    
    const productSubscription = useProduct(productId);
    const appSubscription = useApp(appId);
    
    return (
        <MethodStatusWrapper key={productId+'-'+appId} subscriptions={[productSubscription,appSubscription]}>
            <AppDashboard 
                product={productSubscription.product as IProduct}
                app={appSubscription.app as IApp<any>}
                currentUser={props.currentUser}
            />
        </MethodStatusWrapper>
    );
}


type AppDashboardProps = {
    product: IProduct,
    app: IApp<any>,
    currentUser: IWorldUser
}
const AppDashboard: FunctionComponent<AppDashboardProps> = props => {
    const { app, product, currentUser } = props;

    const dashboardName = (app.dashboardPicker as Function)();
    const dashboard = (app.dashboards || {})[dashboardName];
    
    const { isPhone } = useMediaQueries();

    useEffect( () => {
        window.scrollTo(0, 0);
    });

    const getElement = ( element: TAppDashboardElementType ) => {
        if ( element.type ) {
            if ( element.type == 'report' || element.type == 'widget' || element.type == 'chart') {
                const { type: _reportType, reportId, document } = element.details;

                return (
                    <ReportControl 
                        environment='Dashboard'
                        reportId={reportId}
                        mode={EnumDocumentModes.DASHBOARD}
                        document={document as IGenericDocument}
                        defaults={{} /* das Dashboard verfügt über keine Defaultwerte */}
                        currentUser={currentUser}
                        
                        //onValuesChange={null}
                        elem={null}
                        //app={null}
                    />
                )
            }
        }
        else
            return null;
    }

    const getElements = ( elements: Array<TAppDashboardElementType> ) => {
        return ( elements.map( ( element: TAppDashboardElementType ) => {
            if ( element ) {
                if ( element.width )
                    return <Col key={element._id} {...element.width}>{ getElement( element ) }</Col>;
                else
                    return <Col key={element._id}>{ getElement( element ) }</Col>;
            }
            else
                return null;
        }));
    };
    
    const DashboardRows = ({ rows }:{ rows: Array<any> }): JSX.Element => {
        return (
            <div className="mbac-dashboard-rows">
            { 
                rows.map( ( row:any , index: number ) => {
                    if ( row.elements && row.elements.length )
                        return <Row key={index} gutter= {[16,16]}>
                            { getElements( row.elements ) }
                        </Row>;
                    else
                        return <Fragment/>;
                })
            }
            </div>
        );
    }

    const actionClick = ( action: IAppAction<any> ) => {
        return ( _e: any ) => {
            if (action.onExecute && action.onExecute.redirect) {
                FlowRouter.go(action.onExecute.redirect);
            }
            if (action.onExecute && action.onExecute.force) {
                if (action.onExecute.force == 'new') {
                    FlowRouter.go(`/${product._id}/${app._id}/new`);
                } else {
                    notification.error({
                        message: 'Befehl nicht ausführbar.',
                        description: `Der Befehl "${action.onExecute.force}" kann in diesem Kontext nicht ausgeführt werden. Bitte wenden Sie sich an Ihren Administrator.`
                    });
                }
            }
        }
    }

    const getExtras = ( actions: TAppActions<any> ) => {
        return Object.values(actions).filter( action => action.environment && action.environment.find( env => env == 'Dashboard' ) ).map( (action, index) => {
            return (
                <Button 
                    key={index}
                    type={action.isPrimaryAction ? 'primary' : 'default'}
                    onClick={ actionClick(action) }
                    size={ isPhone ? "small" : "middle" }
                    style={{marginTop:isPhone?4:0}}
                >
                    {action.icon ? <i className={action.icon} style={{marginRight: 8}}/> : null} {action.title}
                </Button>
            )
        });
    }

    return (
        <div className="mbac-page mbac-app-dashboard-page">
            <PageHeader
                className="mbac-page-header"

                title={<span><i className={app?.icon} style={{fontSize:isPhone ? 24:32, marginRight:16 }}/>{app?.title}</span>}
                
                subTitle={isPhone ? undefined : <span style={{marginTop:8, display:'flex'}}>{app?.description}</span>}
                
                extra={ getExtras(app?.actions || {} ) }

                breadcrumb={ isPhone ? undefined :
                    <Breadcrumb>
                        <Breadcrumb.Item>
                            <a href="/">Start</a>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            {product?.title}
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            {app?.title}
                        </Breadcrumb.Item>
                    </Breadcrumb>
                }
            />

            <div className="mbac-page-content">
            {
                ( dashboard && dashboard.rows && dashboard.rows.length )
                    ? <DashboardRows
                        rows={dashboard.rows} 
                    />
                    : null
            }
            </div>
        </div>
    )
}