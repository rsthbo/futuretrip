import React from 'react';
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';

import message from 'antd/lib/message';
import Skeleton from 'antd/lib/skeleton';
import Space from 'antd/lib/space';
import Button from 'antd/lib/button';
import Dropdown from 'antd/lib/dropdown';
import Menu from 'antd/lib/menu';
import Table/*,{ ColumnsType }*/ from 'antd/lib/table';
import Tag from 'antd/lib/tag';
import Card from 'antd/lib/card'
import Statistic from 'antd/lib/statistic';
import Modal from 'antd/lib/modal';
import notification from 'antd/lib/notification';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Progress from 'antd/lib/progress';
import Divider from 'antd/lib/divider'
import Typography from 'antd/lib/typography';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';

const { confirm } = Modal;

import { IChartData, IHtmlElements, IReportAction, IReportActionExecution, IReportCard, IReportChart, IReportDatasourceProps, IReportTable, IRunScriptTools, TColumnRenderer, TReport, TReportCardRendererFn } from '/imports/api/types/world';
import { AppData, IGetReportResult } from '/imports/api/types/app-types';
import { EnumDocumentModes, EnumMethodResult } from '/imports/api/consts';

import { FlowRouter } from 'meteor/kadira:flow-router';
import { deepClone, isArray, isFunction } from '/imports/api/lib/basics';
import { withTracker } from 'meteor/react-meteor-data';
import { getAppStore } from '/imports/api/lib/core';

import PageHeader from 'antd/lib/page-header';
import Breadcrumb from 'antd/lib/breadcrumb';

import { Bar, Line, Pie } from 'react-chartjs-2';
import { GenericControlWrapper, IGenericControlProps } from './generic-control-wrapper';

import moment from 'moment';
import { isOneOf } from '/imports/api/lib/helpers';


// dummyfoo was added to use getAppstore, check, Match and <Tag> in LiveDatasource and Report Actions on the client and server
export const dummyfoo = (): JSX.Element => {
    const x = getAppStore('x');
    check('String', Match.OneOf(String, Boolean));
    
    if ('200' == EnumMethodResult.STATUS_OKAY) return <Tag>{x}</Tag>

    return <Tag>Dummy</Tag>
}

type TReportWithData = TReport<any,any> & {
    data?: AppData<any>
}

interface IReportControlProps extends IGenericControlProps {
    /**
     * Report-Titel. Wird dieser Titel nicht angegeben, so wird der eigentliche
     * Titel des Reports verwandt
     */
    title?: string,
    reportId: string,
    //defaults?: AppData<any>,
    //document?: AppData<any>,
    mode: EnumDocumentModes, // | 'dashboard',
    //currentUser: IWorldUser,
    pageStyle?: boolean
    /**
     * Gibt die Umgebung an, an der der Report gerade platziert ist
     * Handelt es sich um einen allgemeinen Aufruf des Reports mit eigener Seite,
     * wird der Report im Dahsboard angezeigt oder ist der Report Bestandteil eines Dokuments
     */
    environment: 'ReportPage' | 'Dashboard' | 'Document'
}

interface IReportControlState {
    loading: boolean,
    report: TReportWithData | null
}

export class ReportControl extends React.Component<IReportControlProps, IReportControlState> {
    private unmounted: boolean;

    constructor(props:IReportControlProps) {
        super(props);
        
        this.unmounted = true

        this.state = {
            loading : true,
            report: null
        };
    }

    componentDidMount() {
        const { reportId, environment } = this.props;
        
        this.unmounted = false;
        Meteor.call('__reportData.getReport', reportId, (err: Meteor.Error, result: IGetReportResult) => {
            if (err) {
                message.error('Es ist ein unbekannter Systemfehler aufgetreten. Bitte wenden Sie sich an den Systemadministrator.' + err.message);
                if (!this.unmounted) this.setState({ loading: false });
            } else {
                const { status, report } = result;

                if ( status != '200' ) {
                    message.error('Es ist ein Fehler aufgetreten. Bitte wenden Sie sich an den Systemadministrator.' + result.status);
                    if (!this.unmounted) this.setState({ loading: false });
                } else if (report) {
                    if (report.type == 'table') {
                        report.tableDetails.columns = report.tableDetails.columns?.map( c => {
                            const fnCode = c.render;
                            if (fnCode) {
                                let renderer: TColumnRenderer<any>;
                                try{
                                    renderer = eval(fnCode as string);
                                } catch (err) {
                                    console.error(err, 'Fehler in der Funktion:', fnCode);
                                }

                                c.render = function renderColumn(col, doc, { isExport = false }) {
                                    return (renderer as Function)(col, doc, { injectables: report.injectables, isExport, moment });
                                }
                            };

                            if (c.children) {
                                c.children = c.children.map( c => {
                                    const fnCode = c.render;
                                    if (fnCode) {
                                        let renderer: TColumnRenderer<any>;
                                        try{
                                            renderer = eval(fnCode as string);
                                        } catch (err) {
                                            console.error(err, 'Fehler in der Funktion:', fnCode);
                                        }
            
                                        c.render = function renderColumn(col, doc, { isExport = false }) {
                                            return (renderer as Function)(col, doc, { injectables: report.injectables, isExport, moment });
                                        }
                                    };
                                    return c;
                                }) as unknown as any;
                            }
                            
                            return c;
                        });
                    }

                    // löschen der actions, die nicht der aktuellen Umgebung entsprechen
                    report.actions = report.actions?.filter( a => {
                        if (a.visibleAt.find( va => va == environment )){
                            return true;
                        };
                        return false;
                    });
                }

                if (!this.unmounted) {
                    this.setState({ report: report as TReportWithData, loading: false });
                }
            }
        });
    }

    componentWillUnmount() {
		this.unmounted = true
	}

    render() {
        const props = this.props;
        
        const { title, pageStyle = false } = props;
        const { loading, report } = this.state;

        if (loading || !report) return <Skeleton />;

        const { isStatic/*, type*/ } = report;
        
        const reportParams: IReportDatasourceProps<any> = {
            defaults: this.props.defaults as AppData<any>,
            document: this.props.document as AppData<any>,
            mode: this.props.mode, 
            isServer: false,
            currentUser: this.props.currentUser
        }
        
        const RRRReport = <div className={"mbac-report-type-" + report.type }>
            { /* unabhägig vom Reporttype sollten die generall Actions
            dargestellt werden! type == 'table' &&*/ report.actions && !pageStyle ? <ReportGeneralActions report={report} reportParams={reportParams} /> : null }
            { isStatic
                ? <ReportStatic { ...props } report={report} reportParams={reportParams} />
                : <ReportLiveData { ...props } report={report} reportParams={reportParams} />
            }
        </div>

        return (
            <GenericControlWrapper { ...props } withoutInput className={"mbac-report mbac-report-type-" + report.type + ' mbac-report-' + report._id } >
                { pageStyle
                    ? <div className="mbac-page mbac-report-page">
                        <PageHeader
                            className="mbac-page-header"
                            title={<span><i className={report?.icon} style={{fontSize:32, marginRight:16 }}/>{title || report?.title}</span>}
                            subTitle={<span style={{marginTop:8, display:'flex'}}>{report?.description}</span>}
                            extra={ report.actions && <ReportGeneralActions report={report} reportParams={reportParams} /> }

                            breadcrumb={
                                <Breadcrumb>
                                    <Breadcrumb.Item>
                                        <a href="">Home</a>
                                    </Breadcrumb.Item>
                                    <Breadcrumb.Item>
                                        <a href="">Reports</a>
                                    </Breadcrumb.Item>
                                    <Breadcrumb.Item>
                                        {report?.title}
                                    </Breadcrumb.Item>
                                </Breadcrumb>
                            }
                        />
                        <div className="mbac-page-content">
                            { RRRReport }
                        </div>
                    </div>
                    : RRRReport
                }

            </GenericControlWrapper>
        )
    }
}

interface IReportGeneralActionsProps {
    report: TReportWithData
    reportParams: any
}

const ReportGeneralActions = (props: IReportGeneralActionsProps) => {
    const { report, reportParams } = props;
    const { actions } = report;
    
    const generalActions = actions?.filter( ({ inGeneral }) => !!inGeneral);

    const primaryAction = generalActions?.find( ({type}) => type == 'primary');
    const secondaryAction = generalActions?.find( ({type}) => type == 'secondary');
    const moreActions = generalActions?.filter( action => action !== primaryAction && action !== secondaryAction);

    if (!generalActions || generalActions.length == 0) {
        return <div />
    }

    return (
        <div className="report-general-actions">
            <Space>
                { primaryAction && <ReportAction report={report} action={primaryAction} reportParams={reportParams} /> }
                { secondaryAction && <ReportAction report={report} action={secondaryAction} reportParams={reportParams} /> }
                { moreActions && moreActions.length > 0 && <ReportAction report={report} action={moreActions} reportParams={reportParams} /> }
            </Space>
        </div>
    )
}

const executeAction = (onExecute: IReportActionExecution, mode: EnumDocumentModes | "dashboard", defaults: AppData<any>, doc: AppData<any>, rowdoc: AppData<any> | undefined, report: TReportWithData) => {
    let { redirect, exportToCSV, runScript, context } = onExecute;
    
    if (redirect) {
        const data = mode == 'NEW' ? defaults : doc;
        
        if (data) {
            Object.keys(data).forEach( key => {
                redirect = redirect?.replace(new RegExp(`{{parentRecord.${key}}}`, 'g'), encodeURIComponent(data[key]));
                redirect = redirect?.replace(new RegExp(`{{doc.${key}}}`, 'g'), encodeURIComponent(data[key]));
            });
        }

        if (rowdoc) {
            Object.keys(rowdoc || {}).forEach( key => {
                redirect = redirect?.replace(new RegExp(`{{rowdoc.${key}}}`, 'g'), encodeURIComponent(rowdoc[key]));
            });
        }

        return FlowRouter.go(redirect);
    }

    if (exportToCSV) {
        const { data } = report;
        const { tableDetails, injectables } = report as IReportTable<any,any>;
        const { columns } = tableDetails;

        let csvContent = "data:text/csv;charset=utf-8," 
                + columns?.filter( ({key}) => key && key.substring(0,2) != '__' ).map( ({ title }) => title).join('\t') + '\n'
                + data?.map((doc: any) => {
                    return columns?.filter( ({key}) => key && key.substring(0,2) != '__' ).map( c => {
                        if (c.render) {
                            return (c.render as Function)(doc[c.dataIndex as string], doc, { isExport/*renderExport*/: true, injectables, moment });
                        }
                        return doc[c.dataIndex as string];
                    }).join('\t')
                }).join("\n");

        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", exportToCSV.filename);
        //document.body.appendChild(link); // Required for FF

        return link.click();
    }

    if (runScript) {
        
        try {
            let fn;
            if ((runScript as string).toLowerCase().startsWith('function')) {
                fn = eval('fn ='+runScript as string);
            } else {
                fn = eval(runScript as string);
            }
             
            fn.call(context || null, { row: rowdoc, document: doc}, {
                confirm,
                message,
                notification,
                invoke: (name: string, ...args:any[]) => {
                    let callback = (_error: Meteor.Error | any, _result?: any) => {};
                    if (args && isFunction(args[args.length-1])) {
                        callback = args.pop()
                    }
                    Meteor.apply('__app.' + name, args, {}, callback);
                }
            } as IRunScriptTools);
        } catch (err) {
            console.log('Error while runScript.', err);
        }
    }
}


interface IReportActionProps {
    report: TReportWithData
    action: IReportAction | Array<IReportAction>
    reportParams:any
    isRowAction?: boolean
    rowdoc?:AppData<any>
}

const ReportAction = (props: IReportActionProps) => {
    const { report, action, reportParams, isRowAction = false, rowdoc} = props;
    const { defaults, document: doc, mode } = reportParams;
    
    if (isArray(action)) {
        const MenuItems = (action as Array<IReportAction>).map( a => {
            const { type: _type, title, icon, onExecute, disabled, visible } = a;
            const { data } = report;

            const checkDisabled = disabled ? eval(disabled as string) : () => false;
            const checkVisible = visible ? eval(visible as string) : () => true;

            if (!checkVisible({mode, data, defaults, document:doc/*, TODO currentUser*/})) return null;

            return (
                <Menu.Item 
                    key={a.title} 
                    onClick={() => executeAction(onExecute, mode, defaults, doc, rowdoc, report)}
                    disabled={checkDisabled({mode, data: data || [], defaults, document:doc/*, TODO currentUser*/})} 
                >
                    { icon && <i className={icon} style={{marginRight:8}} /> }
                    {title}
                </Menu.Item>
            )
        }).filter(item => item !== null)

        if (MenuItems.length == 0) return null;

        const menu = (
            <Menu>
                { MenuItems }
            </Menu>
        );

        const { type } = report;
        return <Dropdown.Button type={(isRowAction || isOneOf(type, ['widget', 'card', ])  ? "link" : "default") as any} overlay={menu} />
    } else {
        const { type, title, icon, iconOnly, onExecute, disabled, visible } = (action as IReportAction);
        const { data } = report;

        const checkDisabled = disabled ? eval(disabled as string) : () => false;
        const checkVisible = visible ? eval(visible as string) : () => true;

        if (!checkVisible({mode, data: data || [], defaults, document:doc/*, TODO currentUser*/})) return null;

        return (
            <Button 
                key={title} 
                type={isRowAction || iconOnly ? 'link' : (type == 'primary' ? 'primary' : 'secondary') as any}
                onClick={() => executeAction(onExecute, mode, defaults, doc, rowdoc, report)}
                disabled={checkDisabled({mode, data, defaults, document:doc/*, TODO currentUser*/})} 
            >                
                { icon && <i className={icon} style={report.type == 'widget' ? {fontSize:16,color:'#999'}:{marginRight:8}} /> }
                { !iconOnly && title}
            </Button>
        );
    }
}


interface IReportStaticProps extends IGenericControlProps {
    report: TReportWithData
    reportParams: any
}

interface IReportStaticState {
    loading: boolean
    data: Array<any> | IChartData | null
}

export class ReportStatic extends React.Component<IReportStaticProps, IReportStaticState> {
    private unmounted = true;
    private primaryWidgetAction: React.MouseEventHandler<HTMLDivElement> | undefined = undefined;

    private actionColumn:any = null;
    private widgetActions:any = null;

    constructor(props: IReportStaticProps) {
        super(props);

        const { report, reportParams } = props;

        this.state = {
            loading: true,
            data: null //report.type == 'chart' ? { options: null, data: null } : []
        }
        
        if (report.actions) {
            let acs = report.actions.filter( ({ inGeneral }) => !inGeneral )

            const primaryAction = acs.find( ({type}) => type == 'primary' );
            const secondaryAction = acs.find( ({type}) => type == 'secondary' );
            const moreActions = acs.filter( ({type}) => type != 'primary' && type != 'secondary' );

            if ( primaryAction || secondaryAction || (moreActions && moreActions.length)) {
                this.actionColumn = {
                    title: ' ',
                    key: '__action',
                    align: 'right',
                    render: (_text: string, doc: AppData<any>) => (
                        <Space>
                            { primaryAction && <ReportAction isRowAction rowdoc={doc} report={report} action={primaryAction} reportParams={reportParams} /> }
                            { secondaryAction && <ReportAction isRowAction rowdoc={doc} report={report} action={secondaryAction} reportParams={reportParams} /> }
                            { (moreActions.length > 0) && <ReportAction isRowAction rowdoc={doc} report={report} action={moreActions} reportParams={reportParams} /> }
                        </Space>
                    ),
                }

                this.widgetActions = []
                if (primaryAction) {
                    this.primaryWidgetAction = (_e) => {
                        const { mode, defaults, document: doc, rowdoc } = reportParams;
                        executeAction(primaryAction.onExecute, mode, defaults, doc, rowdoc, report);
                    }
                    //this.widgetActions.push(<ReportAction report={report} action={primaryAction} reportParams={reportParams} /> );
                }
                if (secondaryAction) {
                    this.widgetActions.push(<ReportAction report={report} action={secondaryAction} reportParams={reportParams} />);
                }
                if (moreActions && moreActions.length > 0) {
                    this.widgetActions.push(<ReportAction report={report} action={moreActions} reportParams={reportParams} />);
                }
            }

        }
    }

    loadData() {
        const reportId = this.props.report._id;
        const { reportParams } = this.props;
        
        let clonedReportParams = deepClone(reportParams, { transformDate: true, deleteCurrentUser: true });

        Meteor.call('__reports.' + reportId,  { ...clonedReportParams }, (err: Meteor.Error, data: Array<any>) => {
            if (err) {
                message.error('Es ist ein unbekannter Systemfehler aufgetreten. Bitte wenden Sie sich an den Systemadministrator.' + err.message);
                if (!this.unmounted) this.setState({ loading: false });
            } else {
                if (!this.unmounted) this.setState({ data, loading: false });
            }
        });
    }

    componentDidMount() {
        this.unmounted = false;
        this.loadData();
    }

    componentDidUpdate(prevProps: IReportStaticProps, _prevState: IReportStaticState) {
        if (prevProps.reportParams !== this.props.reportParams) {
            this.loadData();
        }
    }

    componentWillUnmount() {
		this.unmounted = true
	}

    render() {
        const { type, title   } = this.props.report;
        const { data, loading } = this.state;

        if (loading) return <Skeleton />;

        if (type == 'table') {
            const { tableDetails } = this.props.report as IReportTable<any,any>;
            const { columns, nestedReportId, noHeader } = tableDetails;
            let cols = columns || [];

            if (this.actionColumn) {
                cols.push(this.actionColumn);
            }

            return <Table 
                rowKey="_id" 
                dataSource={data as any } 
                pagination={false} 
                columns={cols as any } 
                title={noHeader ? undefined : () => 
                    <Space>
                        <span>{title}</span>
                        <Tag color="green">realtime</Tag>
                    </Space>
                }
                
                expandable={!nestedReportId ? undefined : {
                    expandedRowRender: (record:any) => { 
                        return (
                            <div style={{ margin: 0 }}>
                                <ReportControl 
                                    environment='Document'
                                    reportId={nestedReportId}
                                    mode={this.props.mode}
                                    document={record}
                                    defaults={this.props.defaults}
                                    app={this.props.app}
                                    onValuesChange={this.props.onValuesChange}
                                    currentUser={this.props.currentUser} elem={this.props.elem}/>
                            </div>
                        )
                    },
                    rowExpandable: (_record:any) => true,
                }}
            />
        }

        if (type == 'widget') {
            const widgetData: any = data && (data as Array<any>)[0];

            if (!widgetData) {
                return <div>Keine Daten vorhanden</div>
            }

            return (
                <div onClick={this.primaryWidgetAction} style={{color: widgetData.color, cursor: this.primaryWidgetAction ? 'pointer':'default'}} >
                    <Card style={{borderColor: widgetData.color, color: widgetData.color, backgroundColor: widgetData.backgroundColor}}
                        //hoverable
                        actions={this.widgetActions}
                    >
                        <Card.Meta 
                            style={{borderColor: widgetData.color}}
                            //avatar={}
                            title={<span style={{color: widgetData.color}}>{widgetData.title}</span>}
                        />
                        <Statistic
                            value={widgetData.value}
                            prefix={<i style={{marginRight:16}} className={widgetData.icon} />}
                            //prefix={<Avatar size="large" style={{marginRight: 16, backgroundColor: widgetData.color, color: widgetData.backgroundColor}} icon={<i className={widgetData.icon} />}/>}
                            valueStyle={{ color: widgetData.color/* || report.color*/ }}
                        />
                    </Card>
                </div>
            );
            
            // colorful
            return (
                <div onClick={this.primaryWidgetAction} style={{color: widgetData.color, cursor: this.primaryWidgetAction ? 'pointer':'default'}} >
                    <Card style={{borderColor: widgetData.color, color: widgetData.color, backgroundColor: widgetData.backgroundColor}}
                        //hoverable
                        actions={this.widgetActions}
                    >
                        <Card.Meta 
                            style={{borderColor: widgetData.color}}
                            //avatar={}
                            title={<span style={{color: widgetData.color}}>{widgetData.title}</span>}
                        />
                        <Statistic
                            value={widgetData.value}
                            prefix={<i style={{marginRight:16}} className={widgetData.icon} />}
                            //prefix={<Avatar size="large" style={{marginRight: 16, backgroundColor: widgetData.color, color: widgetData.backgroundColor}} icon={<i className={widgetData.icon} />}/>}
                            valueStyle={{ color: widgetData.color/* || report.color*/ }}
                        />
                    </Card>
                </div>
            );
        }

        if (type == 'chart') {
            const chartData: IChartData = data as IChartData;
            const { chartDetails } = this.props.report as IReportChart<any,any>;
            const { chartType } = chartDetails;

            if ( chartType == 'bar') return <Bar getElementAtEvent={(elems, _event) => {console.log(elems)}} options={chartData.options as unknown as any} data={chartData.data as unknown as any} />
            if ( chartType == 'line') return <Line options={chartData.options as unknown as any} data={chartData.data as unknown as any} />
            if ( chartType == 'pie') return <Pie options={chartData.options as unknown as any} data={chartData.data as unknown as any} />
        }

        return <div>Unbekannter Reporttype</div>
    }
}


interface IReportLiveDataControlProps extends IGenericControlProps {
    report: TReportWithData
    reportParams: any
    loading?: boolean
    data?: AppData<any>
}

interface IReportLiveDataControlState {

}

class ReportLiveDataControl extends React.Component<IReportLiveDataControlProps, IReportLiveDataControlState> {
    private actionColumn:any = null;
    private widgetActions:any = null;
    private primaryWidgetAction: React.MouseEventHandler<HTMLDivElement> | undefined = undefined;
    private cardActions: (rowDoc:AppData<any>) => any = () => { return []};

    constructor(props: IReportLiveDataControlProps) {
        super(props);

        const { report, reportParams } = props;
        
        if (report.actions) {
            let acs = report.actions.filter( ({ inGeneral }) => !inGeneral )

            const primaryAction = acs.find( ({type}) => type == 'primary' );
            const secondaryAction = acs.find( ({type}) => type == 'secondary' );
            const moreActions = acs.filter( ({type}) => type == 'more' );
            
            if ( primaryAction || secondaryAction || (moreActions && moreActions.length)) {
                this.actionColumn = {
                    title: ' ',
                    key: '__action',
                    align: 'right',
                    render: (_text: string, doc: AppData<any>) => (
                        <Space>
                            { primaryAction && <ReportAction isRowAction rowdoc={doc} report={report} action={primaryAction} reportParams={reportParams} /> }
                            { secondaryAction && <ReportAction isRowAction rowdoc={doc} report={report} action={secondaryAction} reportParams={reportParams} /> }
                            { (moreActions.length > 0) && <ReportAction isRowAction rowdoc={doc} report={report} action={moreActions} reportParams={reportParams} /> }
                        </Space>
                    ),
                }

                this.widgetActions = []
                if (primaryAction) {
                    this.primaryWidgetAction = (_e) => {
                        const { mode, defaults, document: doc, rowdoc } = reportParams;
                        executeAction(primaryAction.onExecute, mode, defaults, doc, rowdoc, report);
                    }
                    //this.widgetActions.push(<ReportAction report={report} action={primaryAction} reportParams={reportParams} /> );
                }
                if (secondaryAction) {
                    this.widgetActions.push(<ReportAction report={report} action={secondaryAction} reportParams={reportParams} />);
                }
                if (moreActions && moreActions.length > 0) {
                    this.widgetActions.push(<ReportAction report={report} action={moreActions} reportParams={reportParams} />);
                }

                this.cardActions = (rowDoc) => {
                    let actions = [];

                    if (primaryAction) {
                        actions.push(<ReportAction isRowAction rowdoc={rowDoc} report={report} action={primaryAction} reportParams={reportParams} /> );
                    }
                    if (secondaryAction) {
                        actions.push(<ReportAction isRowAction rowdoc={rowDoc} report={report} action={secondaryAction} reportParams={reportParams} />);
                    }
                    if (moreActions && moreActions.length > 0) {
                        actions.push(<ReportAction isRowAction rowdoc={rowDoc} report={report} action={moreActions} reportParams={reportParams} />);
                    }
                    return actions;
                }
            }
        }
    }

    render() {
        const props = this.props;
        const { data, report } = props;
        const { type, title, injectables } = report;

        report.data = data;


        if (type == 'card') {
            const { cardDetails } = report as IReportCard<any,any>;
            const { title:cardTitle, description:cardDescription, cover, avatar} = cardDetails
            const { width } = cardDetails;
            
            const htmlElements: IHtmlElements = { Space, Tag, Statistic, Progress, Divider, Typography, Modal, Form, Button, Input };

            let cardTitleFn: TReportCardRendererFn<any> = eval(cardTitle as unknown as string);

            const dummyRendererFn : TReportCardRendererFn<any> = (_doc:AppData<any>, _htmlElements:IHtmlElements, _injectables) => <div />;
            let cardDescriptionFn = dummyRendererFn;
            if (cardDescription) {
                cardDescriptionFn = eval(cardDescription as unknown as string);
            }

            let coverFn = dummyRendererFn;
            if (cover) {
                coverFn = eval(cover as unknown as string);
            }

            let avatarFn = dummyRendererFn;
            if (avatar) {
                avatarFn = eval(avatar as unknown as string);
            }
            

            return (
                <Row gutter={[16,16]} >
                    {
                        data && data.map( (doc:any) => {
                            return (
                                <Col key={doc._id} {...width} >
                                    <Card 
                                        cover={ cover ? <div className="mbac-card-cover">{coverFn(doc, htmlElements, injectables)}</div> : undefined }
                                            /*<div className="mbac-card-cover">
                                                <Statistic title="Aufwand" value={((doc as AppData<Projekt>).aufwandPlanMinuten / 60 / 8) + ' Tage'} prefix={<i className="fas fa-list" />} />
                                                <Progress percent={30} />

                                                <Statistic title="Erlöse" value={(doc as AppData<Projekt>).erloesePlan + ' €'} prefix={<i className="fas fa-dollar-sign" />} />
                                                <Progress percent={70} />
                                            </div>*/
                                        actions={ this.cardActions(doc) }
                                    >
                                        <Card.Meta
                                            avatar={ avatar ? avatarFn(doc, htmlElements, injectables) : undefined }
                                            title={ cardTitleFn(doc, htmlElements, injectables) }
                                            description={ cardDescription ? cardDescriptionFn(doc, htmlElements, injectables) : undefined }
                                        />
                                    </Card>
                                </Col>
                            )
                        })
                    }                    
                </Row>
            )
        }

        if (type == 'table') {
            const { columns, noHeader, nestedReportId } = (report as IReportTable<any,any>).tableDetails;
            let cols: Array<any> = columns || [];

            if (columns && this.actionColumn) {
                cols = columns.concat([ this.actionColumn ])
            }
            
            return <Table
                rowKey="_id" 
                dataSource={data as any } 
                pagination={false} 
                columns={ cols } 
                title={noHeader ? undefined : () => 
                    <Space>
                        <span>{title}</span>
                        <Tag color="green">realtime</Tag>
                    </Space>
                }
                
                expandable={!nestedReportId ? undefined : {
                    expandedRowRender: (record:any) => { 
                        return (
                            <div style={{ margin: 0 }}>
                                <ReportControl {...props} environment='Document' reportId={nestedReportId} document={record} />
                            </div>
                        )
                    },
                    rowExpandable: (_record:any) => true,
                }}
            />
        }

        if (type == 'widget') {
            const widgetData = data && data[0];

            if (!widgetData) {
                return <div>Keine Daten vorhanden</div>
            }
            
            return (
                <div onClick={this.primaryWidgetAction} style={{marginBottom:16, cursor: this.primaryWidgetAction ? 'pointer':'default'}} >
                    <Card 
                        hoverable={this.primaryWidgetAction ? true:false}
                        actions={this.widgetActions}
                    >
                        <Card.Meta 
                            style={{borderColor: widgetData.color}}
                            //avatar={}
                            title={<span style={{fontSize:12, color:'#999'}}>{widgetData.title}</span>}
                        />
                        <Statistic
                            value={widgetData.value}
                            prefix={<i style={{marginRight:16}} className={widgetData.icon} />}
                            //prefix={<Avatar size="large" style={{marginRight: 16, backgroundColor: widgetData.color, color: widgetData.backgroundColor}} icon={<i className={widgetData.icon} />}/>}
                            valueStyle={{ color: widgetData.color/* || report.color*/ }}
                        />
                    </Card>
                </div>
            );

            // colorful
            return (
                <div onClick={this.primaryWidgetAction} style={{color: widgetData.color, cursor: this.primaryWidgetAction ? 'pointer':'default'}} >
                    <Card style={{borderColor: widgetData.color, color: widgetData.color, backgroundColor: widgetData.backgroundColor}}
                        //hoverable
                        actions={this.widgetActions}
                    >
                        <Card.Meta 
                            style={{borderColor: widgetData.color}}
                            //avatar={}
                            title={<span style={{color: widgetData.color}}>{widgetData.title}</span>}
                        />
                        <Statistic
                            value={widgetData.value}
                            prefix={<i style={{marginRight:16}} className={widgetData.icon} />}
                            //prefix={<Avatar size="large" style={{marginRight: 16, backgroundColor: widgetData.color, color: widgetData.backgroundColor}} icon={<i className={widgetData.icon} />}/>}
                            valueStyle={{ color: widgetData.color/* || report.color*/ }}
                        />
                    </Card>
                </div>
            );
        }

        if (type == 'chart') {
            const { chartType } = (this.props.report as IReportChart<any,any>).chartDetails;

            if ( chartType == 'bar') return <Bar options={data?.options as unknown as any} data={data?.data as unknown as any} />
            if ( chartType == 'line') return <Line options={data?.options as unknown as any} data={data?.data as unknown as any} />
            if ( chartType == 'pie') return <Pie options={data?.options as unknown as any} data={data?.data as unknown as any} />
        }

        return <div>Unbekannter Reporttype</div>
    }
}


interface IReturnProps {
    loading?: boolean
    data?: AppData<any>
}

export const ReportLiveData = withTracker<IReturnProps, IReportLiveDataControlProps>  ( ({ report, reportParams }) => {
    const { _id, liveDatasource } = report;
    let fnLiveData;

    try {
        fnLiveData = eval(liveDatasource as string);
    } catch(err) {
        console.log('Fehler in der Datasource für einen LiveReport: ' + err)
    }

    const subscriptionData = deepClone(reportParams, { transformDate: true, deleteCurrentUser: true });
    const subscription = Meteor.subscribe('__reports.' + _id, subscriptionData);
   
    const liveData = fnLiveData(reportParams);

    return {
        loading: !subscription.ready(),
        data: liveData && liveData.fetch(),
    };
})(ReportLiveDataControl);