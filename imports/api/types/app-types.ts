import { IMethodStatus, IRunScriptTools, IWorldUser, TMoment, TReport } from "./world";
import { EnumControltypes, EnumDocumentModes, EnumFieldTypes, EnumMethodResult } from "../consts";
import { IGenericDocument } from "../lib/core";
import { App } from "../lib/app";
//import { Report } from "../lib/report";
import { ColProps } from "antd/lib/grid";
import { Rule } from "antd/lib/form";
import { ModalFunc } from "antd/lib/modal/confirm";
import { MessageApi } from "antd/lib/message";
import { NotificationApi } from "antd/lib/notification";
import { SliderSingleProps } from "antd/lib/slider";
import React from "react";

export interface IPostProps {
    docId: string
    msg: any
}

export interface IActivitiesReplyToProps {
    docId: string
    activityId: string
    answer: any
}

export type TString = string;

export type TAppLinkItem = {
    _id: string
    title: string
    description: string
    link?: string
    imageUrl?: string
}
export type TAppLink = Array<TAppLinkItem>

export interface IAppLink<T> {
    app: App<T> | string, // placing the App or the id as string
    hasDescription: boolean,
    //description?: (doc:{ [key:string]: any }) => string
    description?: (doc: AppData<T>) => string
    hasImage: boolean,
    imageUrl?: (doc: AppData<T>) => string
    linkable: boolean
    link?: (doc: AppData<T>) => string
}

export interface IGetAppLinkOptionProps {
    appId: string,
    fieldId: string,
    currentInput: string,
    values: Array<any>
}

export interface IGetUsersSharedWithResult extends IMethodStatus {
    users?: Array<{
        userId: string,
        firstName: string,
        lastName: string
    }>
}

export interface IGetDocumentResult<T> extends IMethodStatus {
    document?: AppData<T>
}

export interface IGenericAppLinkOptionsResult extends IMethodStatus {
    options?: Array<IGenericDocument>
}

export type TInjectables = { [key: string]: any }
export interface IAutoValueProps<T> {
    //allValues: { [key:string]: any }

    allValues: AppData<T> //{ [key in keyof T]: T[key] }
    injectables: TInjectables
}

export interface IAppField<T> {
    title?: string
    type: EnumFieldTypes,
    rules?: Array<Rule>,
    autoValue?: (props:IAutoValueProps<T>) => any,
    appLink?: IAppLink<any>,

    namesAndMessages: {
        singular: { 
            ohneArtikel: string, 
            mitArtikel: string
        },
        plural: {
            ohneArtikel: string,
            mitArtikel: string
        },

        messages: {
            onUpdate: string
        }
    }
}

export interface IToolExtras<T> {
    moment: TMoment
    confirm: ModalFunc
    message: MessageApi
    notification: NotificationApi
    /**
     * Invokes an app-method on the Server
     */
    invoke: (name: string, ...args: any[]) => any
    setValue: (fieldName: keyof T, newValue: any) => void
}

export interface IEnabledProps<T> {
    changedValues: IGenericDocument,
    allValues: IGenericDocument,
    mode: EnumDocumentModes,
    tools: IToolExtras<T>
}

export interface IVisibleProps<T> {
    changedValues: AppData<T>,
    allValues: AppData<T>,
    mode: EnumDocumentModes,
    tools: IToolExtras<T>
}

export interface IOnChangeProps<T> {
    changedValues: AppData<T>,
    allValues: AppData<T>,
    mode: EnumDocumentModes,
    tools: IToolExtras<T>
}

export interface IGenericAppLayoutElement<T> {
    field?: keyof T,
    title?: string,
    /**
     * True, if the title should be surpressed for the layout
     */
    noTitle?: boolean,
    controlType: EnumControltypes,
    enabled?: (props:IEnabledProps<T>) => boolean
    visible?: (props:IVisibleProps<T>) => boolean
    onChange?: (props:IOnChangeProps<T>) => void
}

export interface IGoogleMapsLocationProps {
    currentLocation?: string,
    document: IGenericDocument,
    mode: EnumDocumentModes,
    allValues?: IGenericDocument,
    changedValues?: IGenericDocument
}

export interface IAppLayoutElementWidgetSimple<T> extends IGenericAppLayoutElement<T> {
    controlType: EnumControltypes.ctWidgetSimple
    /**
     * Fontawesome icon class like 'fas fa-user'
     */
    icon: string
    color?: string
    backgroundColor?: string,
    render?: (fieldValue: any, doc: AppData<T>) => number | string | JSX.Element
    /**
     * Additional styles for the outer div of the card-component
     **/
    style?: React.CSSProperties
}

export interface IAppLayoutElementDivider<T> extends IGenericAppLayoutElement<T> {
    controlType: EnumControltypes.ctDivider;
    orientation?: 'left' | 'right' | 'center';
}

export interface IAppLayoutElementImage<T> extends IGenericAppLayoutElement<T> {
    controlType: EnumControltypes.ctImage
    /**
     * optional CSS style properties to individual style
     * the image tag
     */
    style?: React.CSSProperties
}


export interface IAppLayoutElementColumns<T> extends IGenericAppLayoutElement<T> {
    controlType: EnumControltypes.ctColumns;
    columns: Array<{
        columnDetails: ColProps & React.RefAttributes<HTMLDivElement>
        elements: Array<TAppLayoutElement<T>>
    }>
}

export interface IAppLayoutElementCollapsible<T> extends IGenericAppLayoutElement<T> {
    title: string;  // title ist verpflichtend, da es keine referenz auf ein Field gib und daher nicht dieser Fieldtitle verwandt werden kann
                    // falls das Propertiy nicht gesetzt ist
    controlType: EnumControltypes.ctCollapsible;
    collapsedByDefault?: boolean;
    elements: Array<TAppLayoutElement<T>>;
}


export interface IAppLayoutElementGoogleMap<T> extends IGenericAppLayoutElement<T> {
    controlType: EnumControltypes.ctGoogleMap,
    googleMapDetails: {
        location: string | ((props:IGoogleMapsLocationProps) => string),
        /**
         * Defines the height of the map-control shown to the user.
         * The default is "500px"
         */
        height?: string,
        /**
         * Defines the width of the map-control shown to the user.
         * The default is "100%"
         */
        width?: string
    }
}

export interface IOptionValue<T> {
    /**
     * Specifies the unique ID of the value
     */
    _id: T
    /**
     * Title of the value to display
     */
    title: string
    /**
     * Optional title for plural
     */
    pluralTitle?: string
    /**
     * Some description for the value
     */
    description?: string
    /**
     * Specifies the color for further use
     */
    color?: string | number
    /**
     * Specifies the backgroundcolor for some further us
     */
    backgroundColor?: string | number
    /**
     * Specifies the fontawesome icon-class eg: "fas fa-building"
     */
    icon?: string,
    /**
     * Specifies indivial options for this item
     */
    options?: any
}

export type TOptionValues<T> = Array<IOptionValue<T>>;

export interface IAppLayoutElementInlineCombination<T> extends IGenericAppLayoutElement<T> {
    title: string,
    controlType: EnumControltypes.ctInlineCombination,
    elements: Array<TAppLayoutElement<T>>;
    style?: React.CSSProperties
}

export interface IAppLayoutElementSpacer<T> extends IGenericAppLayoutElement<T> {
    title: string,
    controlType: EnumControltypes.ctSpacer,
    elements: Array<TAppLayoutElement<T>>;
    /**
     * Additional styles for the outer div of the card-component
     **/
    style?: React.CSSProperties
}

export interface IAppLayoutElementReport<T> extends IGenericAppLayoutElement<T> {
    controlType: EnumControltypes.ctReport,
    reportId: string
}

export interface IAppLayoutElementAppLink<T> extends IGenericAppLayoutElement<T> {
    controlType: EnumControltypes.ctAppLink,
    /**
     * Specifies the max count of items that should be selected
     * If this property was not set the default is 1
     * @default 1
     */
    maxItems?: number
}

export interface IAppLayoutElementSlider<T> extends IGenericAppLayoutElement<T> {
    controlType: EnumControltypes.ctSlider,
    sliderDetails: SliderSingleProps
}

export type THTMLElementProps = {
    element: string,
    className?: string,
    style?: React.CSSProperties,
}
export interface IAppLayoutElementHTMLElement<T> extends IGenericAppLayoutElement<T> {
    controlType: EnumControltypes.ctHtmlElement,
    htmlElementDetails: THTMLElementProps,
    elements?: Array<TAppLayoutElement<T>>
}


export interface IAppLayoutElementOptionInput<T> extends IGenericAppLayoutElement<T> {
    controlType: EnumControltypes.ctOptionInput,
    values: TOptionValues<any>,
    direction?: 'horizontal' | 'vertical',
    defaultValue?: string
}

export interface IAppLayoutElementGenericInput<T> extends IGenericAppLayoutElement<T> {
    controlType: EnumControltypes.ctStringInput | 
                 EnumControltypes.ctTextInput | 
                 EnumControltypes.ctNumberInput | 
                 EnumControltypes.ctCurrencyInput | 
                 EnumControltypes.ctDateInput | 
                 EnumControltypes.ctDatespanInput |
                 EnumControltypes.ctTimespanInput | 
                 EnumControltypes.ctYearInput | 
                 EnumControltypes.ctHtmlInput |
                 EnumControltypes.ctSingleModuleOption;         
}

export type TAppLayoutElement<T> = IAppLayoutElementReport<T> |
                                IAppLayoutElementOptionInput<T> | 
                                IAppLayoutElementDivider<T> | 
                                IAppLayoutElementGoogleMap<T> | 
                                IAppLayoutElementCollapsible<T> |
                                IAppLayoutElementInlineCombination<T> |
                                IAppLayoutElementSpacer<T> |
                                IAppLayoutElementGenericInput<T> |
                                IAppLayoutElementWidgetSimple<T> |
                                IAppLayoutElementAppLink<T> |
                                IAppLayoutElementSlider<T> |
                                IAppLayoutElementColumns<T> |
                                IAppLayoutElementImage<T> |
                                IAppLayoutElementHTMLElement<T>;


export interface IAppLayout<T> {
    title: string,
    description: string,
    visibleBy: Array<string>,
    elements: Array<TAppLayoutElement<T>>;
}

export interface IDefaultAppData<T> extends IAppMethodResult {
    defaults?: DefaultAppData<T>
}

export interface IAppMethodsDefaultProps<T> {
    /**
     * queryParams comming from the client url
     */
    queryParams?: { [key:string]: any }
    /**
     * unknown??? //TODO -> specify
     */
    document?: AppData<T>
    /**
     * Injected on the Server insert method with the NEW-data to insert as document
     */
    NEW?: AppData<T>
    isServer: boolean
}

export interface IAppMethodResult {
    status: EnumMethodResult
    errCode?: string
    statusText?: string
}

export type TCurrentValueFunction<T> = (propName: keyof T) => any;

export interface ITriggerTools<T> {
    /**
     * Returns True if the specified property value has changed,
     * otherwise False
     */
    hasChanged: (propName: keyof T) => boolean
     /**
      * Returns the current Value of the give Prop
      * inside the update-trigger
      */
    currentValue: TCurrentValueFunction<T>
}

export interface IDefaultsTriggerExtras<T> extends ITriggerTools<T> {
    session: any,
    moment: TMoment
}

export interface TInsertTriggerExtras<T> extends ITriggerTools<T> {
    session: any,
    moment: TMoment
}

export interface IUpdateTriggerExtras<T> extends ITriggerTools<T> {
    session: any,
    moment: TMoment
}

export interface IRemoveTriggerExtras<T> extends ITriggerTools<T> {
    session: any,
    moment: TMoment
}

export interface IAppMethods<T> {
    /**
     * Ermittlung dynamischer Defaults für diese App, die als Rückgabewert
     * an die Generic übermittelt werden.
     */
    defaults?: (props: IAppMethodsDefaultProps<T>, triggerExtrags?: IDefaultsTriggerExtras<T>) => Promise<IDefaultAppData<T>>,

    onBeforeInsert?: (values: AppData<T>, triggerExtras: TInsertTriggerExtras<T>) => Promise<IAppMethodResult>,
    onAfterInsert?: (id: string, values: AppData<T>, triggerExtras: TInsertTriggerExtras<T>) => Promise<IAppMethodResult>,
    onBeforeUpdate?: (id: string, values: UpdateableAppData<T>, oldValues: AppData<T>, triggerExtras: IUpdateTriggerExtras<T>) => Promise<IAppMethodResult>,
    onAfterUpdate?: (id: string, values: UpdateableAppData<T>, oldValues: AppData<T>, triggerExtras: IUpdateTriggerExtras<T>) => Promise<IAppMethodResult>,
    onBeforeRemove?: (values: AppData<T>, triggerExtras: IRemoveTriggerExtras<T>) => Promise<IAppMethodResult>,
    onAfterRemove?: (values: AppData<T>, triggerExtras: IRemoveTriggerExtras<T>) => Promise<IAppMethodResult>,
}

export interface IAppRuleExecutionTools<T> extends ITriggerTools<T> {
    session: any
}

//export type TAppRuleConditionProps<T> = { _id: string | null, NEW:AppData<T> | null, OLD:AppData<T> | null } & IAppRuleExecutionTools<T>
export type TAppRuleProps<T> = { triggerTiming?: TTriggerTiming, _id: string | null, NEW:AppData<T> | null, OLD:AppData<T> | null } & IAppRuleExecutionTools<T>
export type TTriggerTiming = 'beforeInsert' | 'afterInsert' | 'beforeUpdate' | 'afterUpdate' | 'beforeRemove' | 'afterRemove';
export type TAppRuleCondition<T> = (props: TAppRuleProps<T>) => Promise<boolean>;
export type TAppRuleExecution<T> = (props: TAppRuleProps<T>) => void
export type TAppRule<T> = {
    _id?: string
    title: string
    description: string
    on: TTriggerTiming | Array<TTriggerTiming>
    when: true | TAppRuleCondition<T>
    then: TAppRuleExecution<T>
}

export type TEnvironment = 'ReportPage' | 'Dashboard' | 'Document'

export interface IAppActionVisibilityProps<T> {
    environment: TEnvironment
    document: AppData<T>
}

export interface IAppAction<T> {
    title: string
    description: string,
    icon: string | undefined,

    /**
     * Specifies a className for the AppAction to style via 
     * CSS or Less
     */
    className?: string

    /**
     * Some individual Element-style
     */
    style?: React.CSSProperties

    isPrimaryAction: boolean,

    /**
     * Function to check if the action is visible or not
     */
    visible?: ({environment, document}:IAppActionVisibilityProps<T>)=>boolean
    
    visibleBy: Array<string>
    executeBy: Array<string>

    /**
     * Gibt die Umgebung an, an der die Action angeboten werden darf
     */
    environment: Array<'ReportPage' | 'Dashboard' | 'Document'>

    onExecute: {
        /**
         * Redirect to any url
         */
        redirect?: string
        /**
         * force a standard action
         */
        force?: 'new' | 'edit' | 'remove'
        /**
         * Client-Script that should be executed
         */
        runScript?: (document: AppData<T>, tools: IRunScriptTools) => void
    }

}

interface IAppDashboardElementTypeGeneric {
    _id: string
    width?: ColProps
}

export interface IAppDashboardElementCard extends IAppDashboardElementTypeGeneric {
    type: 'report'
    details: {        
        reportId: string
        type: 'card'
        //cardType: 'bar' | 'line' | 'pie'
        document?: DefaultAppData<any>
    }
}

export interface IAppDashboardElementChart extends IAppDashboardElementTypeGeneric {
    type: 'report'
    details: {        
        reportId: string
        type: 'chart'
        chartType: 'bar' | 'line' | 'pie'
        document?: DefaultAppData<any>
    }
}

export interface IAppDashboardElementWidget extends IAppDashboardElementTypeGeneric {
    type: 'report'
    details: {        
        reportId: string
        type: 'widget'
        document?: DefaultAppData<any>
    }
}

export interface IAppDashboardElementReport extends IAppDashboardElementTypeGeneric {
    type: 'report'
    details: {        
        reportId: string
        type: 'table'
        document?: DefaultAppData<any>
        //defaults?: DefaultAppData<any>
    }
}

export type TAppDashboardElementType =  IAppDashboardElementReport | 
                                        IAppDashboardElementWidget | 
                                        IAppDashboardElementChart |
                                        IAppDashboardElementCard;

export type TAppDashboardRow = { elements: Array<TAppDashboardElementType> };

export interface IAppDashboard {
    rows: Array<TAppDashboardRow>
}

export type InsertableAppData<T> = { [key in keyof T]?: T[key] }

/**
 * Every AppData property as optional of Type T without the _id prop
 */
export type UpdateableAppData<T> = { [key in keyof T]?: T[key] } & {
    // ID could not be updated _id?: string
    _rev?: number
};

export type DefaultAppData<T> = { [key in keyof T]?: T[key] } & {
    _id?: string 
    _rev?: number
};

export type TSharedWithItem = {
    user: {
        userId: string,
        firstName: string,
        lastName: string
    }
    role?: string
}
export type TSharedWith = Array<TSharedWithItem>;

export type AppData<T> = { [key in keyof T]: T[key] } & {
     _id: string
     _rev: number

     sharedWith: TSharedWith
     /**
      * Rollen, mit denen das Dokument geteilt ist
      * Das teilen mit Rollen ist eine "Abkürzung" für das sharedWith
      * mit dem Vorteil nicht alle Benutzer einzeln aufzuzeigen
      */
     sharedWithRoles?: Array<string>
};

export interface IGenericApp {
    title: string;
    description: string;
}

export type TAppFields<T> = {
    [key in keyof T]: IAppField<T>
}

export type TAppActions<T> =  {
    [key: string]: IAppAction<T>
}

export type TLayoutFilterProps<T> = {
    document: AppData<T>,
    defaults: DefaultAppData<T>,
    mode:EnumDocumentModes,
    currentUser:IWorldUser,
}

export interface IApp<T> {
    _id?: string,
    productId?: string,

    title: string,
    description: string,
    icon: string,
    position?: number,

    sharedWith: Array<string>,
    sharedWithRoles: Array<string>,

    namesAndMessages: {
        singular: {
            mitArtikel: string,
            ohneArtikel: string
        },
        plural: { 
            mitArtikel: string,
            ohneArtikel: string
        },

        messages: {
            activityRecordInserted?: string
            activityRecordUpdated?: string
            activityRecordRemoved?: string
        }
    },

    fields: TAppFields<T>,

    /**
     * Returns the name of the layout which should be rendered
     * for the current user
     */
    layoutFilter?: string | ((props: TLayoutFilterProps<T>) => string)

    layouts: {
        [key: string]: IAppLayout<T>
    },
    actions: TAppActions<T>

    methods: IAppMethods<T>

    dashboardPicker: string | (() => string),
    dashboards: {        
        [ key: string ]: IAppDashboard
    },

    injectables?: TInjectables
}

export interface IAppresult<T> extends IMethodStatus {
    app?: IApp<T>
}

export interface IAppsresult<T> extends IMethodStatus {
    apps?: Array<IApp<T>> | null
}

export interface IGetReportResult extends IMethodStatus {
    report?: TReport<any, any>
}

export interface IGenericInsertArguments<T> {
    productId: string,
    appId: string,
    values: AppData<T>
}

export interface IGenericUpdateArguments<T> {
    productId: string,
    appId: string,
    docId: string,
    values: AppData<T>
}

export interface IGenericRemoveArguments {
    productId: string,
    appId: string,
    docId: string
}

export interface IGenericInsertResult extends IMethodStatus {
    docId?: string | null
}

export interface IGenericUpdateResult extends IMethodStatus {
    affectedDocs?: number | null
}

export interface IGenericRemoveResult extends IMethodStatus {
    affectedDocs?: number | null
}

export interface IGenericDefaultResult extends IMethodStatus {
    defaults?: DefaultAppData<any>
}

export interface ILockResult extends IMethodStatus {
    lockId?: string
}