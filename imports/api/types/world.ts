import { Meteor, Subscription } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { AppData, TAppLink, TAppLinkItem, TInjectables } from './app-types';
import { EnumDocumentModes, EnumMethodResult } from '/imports/api/consts';
import { ChartOptions, ChartData } from 'chart.js';

import { ModalFunc } from 'antd/lib/modal/confirm';
import { MessageApi } from 'antd/lib/message';
import { NotificationApi } from 'antd/lib/notification';
import { ColProps } from 'antd/lib/grid';
import { TypographyProps } from 'antd/lib/typography';
//import { ColumnsType } from 'antd/lib/table';

export interface IUserShort {
    userId: string,
    firstName: string,
    lastName: string
}

export interface ISharedWith {
    user: IUserShort,
    role?: string
}

export interface IMethodStatus {
    status: EnumMethodResult,
    errCode?: string,
    statusText?: string,
}

export interface IProduct {
    _id?:string,
    title: string,
    description: string,
    position?: number,
    icon?: string,
    sharedWith: Array<ISharedWith>,
    sharedWithRoles: Array<string>
}

export interface IProductresult extends IMethodStatus {
    product?: IProduct
}

export interface IProductsresult extends IMethodStatus {
    products?: Array<IProduct>
}

export interface IClientCollectionResult extends IMethodStatus {
    appIds?: Array<string/*|undefined*/> | null
}

export interface ILoginDefiniton {
    imageUrl: string,
    welcome?: string,
    introduction?: string,

    with: {
        password?: boolean
        google?: boolean
        facebook?: boolean
    }
    register: boolean | string
    forgotPassword: boolean | string
}

export interface IRegisterData {
    initialRoles: Array<string>
}

export interface IWorld {
    title: string,
    description: string,
    imageUrl: string,
    login: ILoginDefiniton
    register?: IRegisterData
}

export interface IUserData {
    roles: Array<string>,
    firstName: string,
    lastName: string,
    accountVerified:boolean
}

export interface IWorldUser extends Meteor.User {
    userData: IUserData
}


export interface IChartData {
    options: ChartOptions, data: ChartData
}

export type TMoment = (momentInput: any) => moment.Moment;

export interface IReportRendererExtras {
    injectables: TInjectables
    isExport: boolean,
    moment: TMoment
}

export type TColumnRenderer<T> = string | ((columnData: any, doc:AppData<T>, extras: IReportRendererExtras) => string | JSX.Element)

export interface IReportDatasourceProps<T>{
    document?: AppData<T>
    defaults?: AppData<T>
    mode: EnumDocumentModes | "dashboard"
    isServer: boolean,
    publication?: Subscription // nur serverseitig verfügbar
    currentUser: IWorldUser
}

export type TReportDatasource<T> = string | ((props: IReportDatasourceProps<T>) => Mongo.Cursor<T> | { fetch: () => any } | void | Array<any> );

export interface IReportColumns<T> {
    title: string
    key?: string
    dataIndex?: string
    render?: TColumnRenderer<T>
    align?: 'left' | 'right' | 'center'

    children?: Array<IReportColumns<T>>
}

export interface IHtmlElements {
    Space: any
    Tag: any
    Statistic: any
    Progress: any
    Divider: any
    Modal: any
    Input: any
    Form: any
    Typography: TypographyProps,
    Button: any
}

export interface IReport<ParentOrCaller> {
    _id?: string

    title: string
    description: string
    
    //type: 'table' | 'chart' | 'widget' | 'card'
    
    icon?:string
    isStatic: boolean
    staticDatasource?: TReportDatasource<ParentOrCaller>
    liveDatasource?: TReportDatasource<ParentOrCaller>
    injectables?: TInjectables
    actions?: Array<IReportAction>
}

export type TReportCardRendererFn<T> = (document: AppData<T>, htmlElements: IHtmlElements, injectables: TInjectables | undefined) => string | JSX.Element;

export interface IReportCard<T, Parent> extends IReport<Parent> {
    type: 'card',

    cardDetails: {
        width: ColProps,

        title: TReportCardRendererFn<T>
        description?: TReportCardRendererFn<T>
        cover?: TReportCardRendererFn<T>
        avatar?: TReportCardRendererFn<T>
    }
}
export interface IReportTable<T, Parent> extends IReport<Parent> {
    type: 'table',

    tableDetails: {
        /**
         * Hides the title section of an table typed report
         */
        noHeader?: boolean
        /**
         * Definition of columns to be displayed for table-report
         */
        columns?: Array<IReportColumns<T>> // im original antd = ColumnsType<any>
        /**
         * ID of a given Report to show as nested report for
         * each data column
         */
        nestedReportId?: string
    }
}
export interface IReportChart<_T, Parent> extends IReport<Parent> {
    type: 'chart',

    chartDetails: {
        chartType?: 'bar' | 'line' | 'pie'
    }
}
export interface IReportWidget<_T, Parent> extends IReport<Parent> {
    type: 'widget',
}

/*export interface IReport1<T, Caller> {
    _id?: string
    title: string
    description: string
    noHeader?: boolean
    type: 'table' | 'chart' | 'widget' | 'card'
    chartType?: 'bar' | 'line' | 'pie'
    icon?:string
    columns?: Array<IReportColumns<T>> // im original antd = ColumnsType<any>
    isStatic: boolean
    staticDatasource?: TReportDatasource<Caller>
    liveDatasource?: TReportDatasource<Caller>
    injectables?: TInjectables
    actions?: Array<IReportAction>
    nestedReportId?: string
}*/

export type TReport<T, Parent> = IReportCard<T, Parent> | IReportTable<T, Parent> | IReportChart<T, Parent> | IReportWidget<T, Parent>;

export interface IDisableReportActionProps {
    mode: EnumDocumentModes
    data: AppData<any>
    record: AppData<any>
    defaults: AppData<any>
    currentUser: IWorldUser
}

export interface IReportAction {
    title: string;
    description: string;
    icon?: string;
    iconOnly?: boolean;
    /**
     * gibt an, ob die Action z.B. Neuzugang als alg. Aktion überhalb des Reports dargestelt wird
     * oder für jeden einzelnen Datensatz angeboten wird
     */
    inGeneral?: boolean;
    /**
     * gibt an, ob dies die "Haut"Aktion ist. Diese wird im rendering direkt dargestellt und hervorgehben
     */
    type: 'primary' | 'secondary' | 'more';

    /**
     * Gibt an, ob die Action nur im Bezug eines Hauptreports (pageStyle = true)
     * angezeigt werden soll oder ob die Action nur im Dashboard oder im Dokument angezeigt werden soll.
     */
    visibleAt: Array<'ReportPage' | 'Dashboard' | 'Document'>

    visibleBy: Array<string>
    executeBy: Array<string>
    
    /**
     * Funktion, die prüft ob die Action deaktiviert werden soll oder nicht
     */
    disabled?: string | ( ( props: IDisableReportActionProps ) => boolean );
    /**
     * Funktion, die prüft ob die Action angezeigt werde soll oder nicht
     */
    visible?: string | ((props: IDisableReportActionProps) => boolean);
    
    onExecute: IReportActionExecution;
}


export interface IRunScriptData {
    /**
     * current rowdata of the report where the action is located
     */
    row: AppData<any>
    /**
     * Parent/Document that was displayed where the report is implemented
     * in the layout
     */
    document: AppData<any>
}

export interface IRunScriptTools {
    confirm: ModalFunc,
    message: MessageApi,
    notification: NotificationApi,
    htmlElements: IHtmlElements,
    getAppLink: (doc: AppData<any>, { link }: { link: string }) => TAppLink
    getAppLinkItem: (doc: AppData<any>, { link }: { link: string }) => TAppLinkItem
    /**
     * Invokes an app-method on the Server
     */
    invoke: (name: string, ...args: any[]) => any;
}

export interface IReportActionExecution {
    /**
     * URL, die aufgerufen werden soll, sobald die Aktion ausgeführt wird
     */
    redirect?: string
    /**
     * Export in CSV, wobei filename den Dateiname als Vorschlag angibt
     * Der Export erfolgt client-seitig
     */
    exportToCSV?: {
        filename: string
    }
    /**
     * Funktion, die als methode für Server und client registriert wird
     */
    runScript?: string | ((data: IRunScriptData, tools: IRunScriptTools) => void);
    /**
     * Data that will be accessed via "this conext" in the runScript function
     */
    context?: {
        [key: string]: any
    }
}