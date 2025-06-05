import { Meteor, Subscription } from "meteor/meteor";
import { check } from "meteor/check";
import { Mongo } from "meteor/mongo";
//import { MongoInternals, InsertOneWriteOpResult, UpdateWriteOpResult, WriteOpResult } from 'meteor/mongo';
import * as SuperMongo from "meteor/mongo";
const { MongoInternals } = SuperMongo as unknown as any;

export interface InsertOneWriteOpResult {
    insertedId: string
}
export interface UpdateWriteOpResult {
    modifiedCount: number
}
export interface WriteOpResult {
    result: { ok: number }
}


import { EnumFieldTypes, EnumMethodResult } from "../consts";
import { IMethodStatus, IWorldUser } from "../types/world";
import { isFunction, deepClone, isArray, isString } from "./basics";
import { Product } from "./product";
import { ActivitySchema, AnswerSchema, AppActionSchema, AppFieldSchema, AppLayoutElementsSchema, AppLayoutSchema, AppSchema } from "./schemas";
import { MethodInvocationFunction } from "./types";
import { World } from "./world";
import moment from 'moment'

import { 
    AppData, IActivitiesReplyToProps, IApp, 
    IDefaultAppData, IGenericAppLinkOptionsResult, IGenericDefaultResult, IGenericInsertResult, 
    IGenericRemoveResult, IGenericUpdateResult, IGetAppLinkOptionProps, IGetDocumentResult, 
    IGetUsersSharedWithResult, ILockResult, InsertableAppData, IPostProps, 
    TAppLink, TAppRule, TAppRuleProps, TTriggerTiming, UpdateableAppData 
} from "/imports/api/types/app-types";

import { injectUserData } from "./roles";
import { Activities } from "./activities";
import SimpleSchema from "simpl-schema";
import { createAppStore, IGenericDocument } from "./core";
import { Report } from "./report";
import { AppRuleError } from "./error";

interface IAppCache {
    [key:string]: any //IApp<T>
}

var appCache: IAppCache = {};

type TAppDataChanges = Array<{
    what: string,
    message: string,
    propName: string,
    oldValue: any,
    newValue: any
}>;

interface IChanges {
    message: string;
    changes: TAppDataChanges
}



const messageWithMentions = ({currentUser: _foo, msg, refs: __foo1}:any) => {
    let { text, mentions } = msg;

    let message = text.replace(/\n/g, '<br>');

    // check mentions
    if (mentions) {
        Object.keys(mentions).forEach( userId => {
            const username = mentions[userId];
            const userMentionRegExp = new RegExp('@' + username, 'g');

            if (message.indexOf('@' + username) > -1) {
                message = message.replace(userMentionRegExp, `<span class="mbac-user-mention" user-id="${userId}">${username}</span>`);

                /*TODO: const useractivity = injectUserData({ currentUser }, { 
                    refUser: userId,
                    type: 'MENTIONED',
                    message: `${currentUser.userData.firstName} ${currentUser.userData.lastName} hat Sie erwähnt.`,
                    originalContent: message,
                    refs,
                    unread: true
                }, { created: true });

                try {
                    UserActivitySchema.validate(useractivity);
                } catch (err) {
                    throw new Meteor.Error(err.message);
                }
                
                UserActivities.insert(useractivity);*/
            }
        });
    }

    return message;
}

export class App<T> {
    private world: World
    public product: Product

    public appId: string; 

    private collection: Mongo.Collection<any>;
    public app: IApp<T>;
    private appRules: Array<TAppRule<T>> = [];

    constructor(world: World, product: Product, appDef: IApp<T>) {
        this.world = world;
        this.product = product;
        
        const App = this.world.appCollection;

        appDef.productId = this.product.productId;
        
        const _appDef = deepClone(appDef);
        
        if (_appDef.methods && _appDef.methods.defaults) {
            _appDef.methods.defaults = _appDef.methods.defaults.toString();
        }
        
        if (isFunction(_appDef.dashboardPicker)) {
            _appDef.dashboardPicker = _appDef.dashboardPicker.toString();
        }

        console.log('start validating App ' + _appDef._id);

        let fields = Object.keys(_appDef.fields);
        fields.forEach( fieldName => {
            console.log('Validate field ', fieldName);

            let f = _appDef.fields[fieldName];
            // generiere den Titel anhand des Property-Namen
            if (!f.title) {
                let result = fieldName.replace( /([A-Z])/g, ' $1' );
                f.title = result.charAt(0).toUpperCase() + result.slice(1);
            }

            if (f.rules) {
                f.rules = f.rules.map( (r:any) => {
                    if (r.customValidator) {
                        r.customValidator = r.customValidator.toString();
                    }
                    return r;
                })
            }
            
            if (f.moduleDetails) {
                if (f.moduleDetails.description) f.moduleDetails.description = f.moduleDetails.description.toString();
                if (f.moduleDetails.imageUrl) f.moduleDetails.imageUrl = f.moduleDetails.imageUrl.toString();
                if (f.moduleDetails.link) f.moduleDetails.link = f.moduleDetails.link.toString();
            }

            
            if (f.appLink && f.appLink.app) {
                let refAppId: string = '';
                if (isString(f.appLink.app)) {
                    refAppId = f.appLink.app;
                } else {
                    // App-Class
                    refAppId = f.appLink.app.appId;
                }
                
                f.appLink.app = refAppId;
                console.log('Applink:', refAppId);

                if (isFunction(f.appLink.description)) f.appLink.description = f.appLink.description.toString();
                if (isFunction(f.appLink.link)) f.appLink.link = f.appLink.link.toString();
            }

            if (f.autoValue) f.autoValue = f.autoValue.toString();

            try {
                AppFieldSchema.validate(f);
            } catch (err) {
                console.log(err.message);
                process.exit(1);
            }
            _appDef.fields[fieldName] = f;
        });

        if (_appDef.actions) {
            let actions = Object.keys(_appDef.actions);
            actions.forEach( actionName => {
                console.log('Validate action ', actionName);
    
                let a = _appDef.actions[actionName];
                // generiere den Titel anhand des Property-Namen
                if (!a.title) {
                    let result = actionName.replace( /([A-Z])/g, ' $1' );
                    a.title = result.charAt(0).toUpperCase() + result.slice(1);
                }

                if (a.visible && isFunction(a.visible)) a.visible = a.visible.toString();
                if (a.onExecute && a.onExecute.runScript && isFunction(a.onExecute.runScript)) a.onExecute.runScript = a.onExecute.runScript.toString();

                try {
                    AppActionSchema.validate(a);
                } catch (err) {
                    console.log(err.message);
    
                    process.exit(1);
                }
    
                _appDef.actions[actionName] = a;
            });
        }

        if (_appDef.layoutFilter && isFunction(_appDef.layoutFilter)) _appDef.layoutFilter = _appDef.layoutFilter.toString();
        if (_appDef.layouts) {
            let layouts = Object.keys(_appDef.layouts);
            layouts.forEach( layoutName => {
                console.log('Validate layout ', layoutName);
    
                let l = _appDef.layouts[layoutName];
                
                if (!l.title) {
                    let result = layoutName.replace( /([A-Z])/g, ' $1' );
                    l.title = result.charAt(0).toUpperCase() + result.slice(1);
                }
    
                const validateLayoutElements = (elements: any) => {
                    elements = elements.map( (elem: any) => {
                        if (!elem.title && elem.field) {
                            // wenn kein Titel vorhanden, dann nehmen wir den Feldtitel
                            if (!_appDef.fields[elem.field]) {
                                throw new Error(`Das Feld '${elem.field}' ist in der fields-Auflistung nicht vorhanden.`);
                                process.exit(1);
                            }
                            elem.title = _appDef.fields[elem.field].title; 
                        }
    
                        if (elem.columns) {
                            elem.columns = elem.columns.map( (col:any) => {
                                col.elements = validateLayoutElements(col.elements);
                                return col;
                            })
                        }
                        
                        if (elem.googleMapDetails && elem.googleMapDetails.location) {
                            elem.googleMapDetails.location = elem.googleMapDetails.location.toString();
                        }
                        
                        if (elem.enabled) {
                            elem.enabled = elem.enabled.toString();
                        }
    
                        if (elem.visible) {
                            elem.visible = elem.visible.toString();
                        }

                        if (elem.onChange) {
                            elem.onChange = elem.onChange.toString();
                        }

                        if (elem.render) {
                            elem.render = elem.render.toString();
                        }
    
                        AppLayoutElementsSchema.validate(elem);
    
                        if (elem.elements) 
                            elem.elements = validateLayoutElements(elem.elements);
                        
                            return elem;
                    })
    
                    return elements;
                }
    
                if (l.elements) l.elements = validateLayoutElements(l.elements);

                try {
                    AppLayoutSchema.validate(l);
                } catch (err) {
                    console.log(l);
                    console.log(err.message);
    
                    process.exit(1);
                } 
    
                _appDef.layouts[layoutName] = l;
            })
        }
    
        if (_appDef.methods) {
            if (typeof _appDef.methods.defaults === 'function') _appDef.methods.defaults = _appDef.methods.defaults.toString();
            if (typeof _appDef.methods.onBeforeInsert === 'function') _appDef.methods.onBeforeInsert = _appDef.methods.onBeforeInsert.toString();
            if (typeof _appDef.methods.onBeforeUpdate === 'function') _appDef.methods.onBeforeUpdate = _appDef.methods.onBeforeUpdate.toString();
            if (typeof _appDef.methods.onBeforeRemove === 'function') _appDef.methods.onBeforeRemove = _appDef.methods.onBeforeRemove.toString();
    
            if (typeof _appDef.methods.onAfterInsert === 'function') _appDef.methods.onAfterInsert = _appDef.methods.onAfterInsert.toString();
            if (typeof _appDef.methods.onAfterUpdate === 'function') _appDef.methods.onAfterUpdate = _appDef.methods.onAfterUpdate.toString();
            if (typeof _appDef.methods.onAfterRemove === 'function') _appDef.methods.onAfterRemove = _appDef.methods.onAfterRemove.toString();
        }

        if (_appDef.dashboards) {
            let dashboards = Object.keys(_appDef.dashboards);
            dashboards.forEach( dashboardName => {
                console.log('Validate dashboard ', dashboardName);
    
                let d = _appDef.dashboards[dashboardName];
                d.rows = d && d.rows.map( (row:any) => {
                    if (!row.elements) throw new Error("Es fehlt die Angabe der elements innerhalb der row");
                    
                    return { elements: row.elements.map ( (el:any) => {
                        if (el instanceof Report) {
                            const rep:Report = el as Report;
                            return {
                                _id: rep.reportId,
                                type: 'report',
                                details: {
                                    reportId: rep.reportId,
                                    type: rep.report?.type
                                }
                            }
                        } else {
                            // für andere Dashboard-types, die noch ggf. benötigt werden
                            // ausser Reports
                            return el;
                        }
                    })}
                });                
            })
        }

        try {
            AppSchema.validate(_appDef);
        } catch (err) {
            console.log(err);
            process.exit(1);
        }

        this.appId = App.insert(_appDef);
        this.app = appDef;

        appCache[this.appId] = appDef;

        // create the new collection
        this.collection = createAppStore(this.appId);

        // register all neccessary methods that could fired to this app from client-side
        Meteor.methods({
            ['__app.' + this.appId + '.getDefaults']: this.getDefaults(),
            ['__app.' + this.appId + '.getAppLinkOptions']: this.getAppLinkOptions(),
            ['__app.' + this.appId + '.getUsersSharedWith']: this.getUsersSharedWith(),
            ['__app.' + this.appId + '.getDocument']: this.getDocument(),
            ['__app.' + this.appId + '.insertDocument']: this.insertDocument(),
            ['__app.' + this.appId + '.updateDocument']: this.updateDocument(),
            ['__app.' + this.appId + '.removeDocument']: this.removeDocument(),
            ['__app.' + this.appId + '.activities.post']: this.post(),
            ['__app.' + this.appId + '.activities.replyTo']: this.activitiesReplyTo(),
            ['__app.' + this.appId + '.lock']: this.lockDocument(),
        });

        // register all publications for this app
        const self = this;
        Meteor.publish('__app.' + this.appId + '.document', function publishDocument(this:Subscription, {docId}:{docId:string}) {
            if (!docId)
                return this.ready();
        
            check(docId, String);
        
            const currentUser = <IWorldUser>Meteor.users.findOne(<string>this.userId);
        
            if (!currentUser)
                return this.ready();
            
            return self.collection.find({
                $and: [
                    { _id: docId },
                    {
                        $or: [
                            { "sharedWith.user.userId": currentUser._id },
                            { sharedWithRoles: { $in: currentUser.userData.roles } }
                        ]
                    }
                ]
            });
        });

        Meteor.publish('__app.' + this.appId + '.activities', function publishAppActivities(this:Subscription, docId: string) {
            if (!docId)
                return this.ready();
        
            check(docId, String);
        
            const currentUser = <IWorldUser>Meteor.users.findOne(<string>this.userId);
        
            if (!currentUser)
                return this.ready();
        
            return Activities.find({ appId: self.appId, docId });
        });

        Meteor.publish('__app.' + this.appId + '.islocked', function publishDocumentLocks(this:Subscription, docId: string) {
            if (!docId)
                return this.ready();
        
            check(docId, String);
        
            const currentUser = <IWorldUser>Meteor.users.findOne(<string>this.userId);
        
            if (!currentUser)
                return this.ready();
                    
            return self.world.locksCollection.find({ appId: self.appId, docId }); 
        });
    }

    private getAppLinkOptions():MethodInvocationFunction {
        const self = this;
    
        return function(this:{userId:string}, info: IGetAppLinkOptionProps):IGenericAppLinkOptionsResult {
            new SimpleSchema({
                appId: { type: String },
                fieldId: { type: String },
                currentInput: { type: String },
                values: { type: Array, optional: true },
                'values.$': { 
                    type: new SimpleSchema({
                        _id: { type: String },
                        title: { type: String },
                        description: { type: String },
                        link: { type: String, optional: true },
                        imageUrl: { type: String, optional: true }
                    }) 
                },
            }).validate(info);

            const { appId, fieldId, currentInput, values } = info;
            
            const currentUser = <IWorldUser>Meteor.users.findOne(<string>this.userId);
            if (!currentUser)
                return { status: EnumMethodResult.STATUS_NOT_LOGGED_IN };
    
            const refApp = appCache[appId];
            
            const field = refApp.fields[fieldId];
            
            let data = self.collection.find({
                $and: [
                    { title: { $regex: currentInput, $options: 'i' } },
                    { _id: { $nin: values.map( v => v._id ) } },
                    {
                        $or: [
                            { "sharedWith.user.userId": currentUser._id },
                            { sharedWithRoles: { $in: currentUser.userData.roles } }
                        ]
                    }
                ]
            }).fetch() as Array<IGenericDocument>;
            
            let getDescription = (doc: any) => {
                if (field && field.appLink && field.appLink.hasDescription)
                    return doc.description || null;
                return null;
            }
            // prüfen, ob es eine Funktion zum rendern der description gibt
            if (field && field.appLink && field.appLink.description) {
                getDescription = eval(field.appLink.description as unknown as string);
            }
    
            let getImageUrl = (doc: any) => {
                if (field && field.appLink && field.appLink.hasImage)
                    return doc.imageUrl || null;
                return null;
            }
            // prüfen, ob es eine Funktion zum rendern der description gibt
            if (field && field.appLink && field.appLink.imageUrl) {
                getImageUrl = eval(field.appLink.imageUrl as unknown as string);
            }

            // prüfen, der Eintrag verlinkbar sein soll
            const getLink = (doc: any): string | null => {
                if (field && field.appLink && field.appLink.linkable) {
                    if (field.appLink.link && isFunction(field.appLink.link)) {
                        return field.appLink.link(doc);
                    } else {
                        return `/${self.product.productId}/${self.appId}/${doc._id}`;
                    }
                }

                return null;
            }
            
            const options: Array<IGenericDocument> = data.map( doc => {            
                doc.description = getDescription(doc);
                doc.imageUrl = getImageUrl(doc);
                doc.link = getLink(doc);
    
                return doc;
            });

            return { status: EnumMethodResult.STATUS_OKAY, options }
        }
    }

    private getDefaults():MethodInvocationFunction {
        const self = this;

        return async function(this:{userId:string}, info: any): Promise<IGenericDefaultResult> {
            new SimpleSchema({
                //productId: { type: String }, wird eigentlich gar nicht benötigt
                appId: { type: String },
                queryParams: { type: Object, blackbox: true, optional: true }
            }).validate(info);
    
            const { appId, queryParams } = info;
    
            let result: IDefaultAppData<T> | null = null;
            if (self.app.methods && self.app.methods.defaults && isFunction(self.app.methods.defaults)) {
                try {
                    result = await self.app.methods.defaults({queryParams, isServer: true}, { moment, session: undefined, hasChanged: self.hasChanged(null, null), currentValue: self.currentValue(null, null) });
                } catch (err) {
                    return { 
                        status: EnumMethodResult.STATUS_SERVER_EXCEPTION, 
                        statusText: `Es ist ein Fehler beim ermitteln der Defaultwerte für die App "${appId}" aufgetreten.\n${err.message}`,
                    };
                }
            }
            
            return { status: EnumMethodResult.STATUS_OKAY, defaults: result?.defaults || {} };
        }
    }
    
    private getUsersSharedWith():MethodInvocationFunction {
        const self = this;

        return function(this:{userId:string}, data: any):IGetUsersSharedWithResult {
            const { docId, activityId } = data;

            try {
                check(docId, String);
                activityId && check(activityId, String);
            } catch (err){
                return { status: EnumMethodResult.STATUS_SERVER_EXCEPTION, statusText: `Die angegebenen Parameter entsprechen nicht der Signatur für "${self.appId}.getUsersSharedWith()"` }
            }

            const currentUser = <IWorldUser>Meteor.users.findOne(this.userId);

            if (!currentUser) {
                return { status: EnumMethodResult.STATUS_NOT_LOGGED_IN, statusText: 'Sie sind nicht am System angemeldet' }
            }
            
            const currentDocument = self.collection.findOne({_id: docId});
            if (!currentDocument) {
                return { status: EnumMethodResult.STATUS_NOT_FOUND, statusText: 'Das angegebene Dokument wurde nicht gefunden.' }
            }

            const sharedWithUserIds = currentDocument.sharedWith.map( (sw: any) => sw.user.userId );
            
            const users = Meteor.users.find({
                $or: [
                    { _id: { $in: sharedWithUserIds } },
                    { 'userData.roles': { $in: currentDocument.sharedWithRoles } },
                ]
            }, {fields: { _id:1, 'userData.firstName': 1, 'userData.lastName': 1 }}).map( (user:any) => { 
                const u: IWorldUser = user;
                return { 
                    userId: u._id,
                    firstName: u.userData.firstName,
                    lastName: u.userData.lastName
                }
            });

            return { status: EnumMethodResult.STATUS_OKAY, users};
        }
    }

    private getDocument():MethodInvocationFunction {
        const self = this;

        return function(this:{userId:string}, docId: string):IGetDocumentResult<T> {
            
            try {
                check(docId, String);
            } catch (err){
                return { status: EnumMethodResult.STATUS_SERVER_EXCEPTION, statusText: `Die angegebenen Parameter entsprechen nicht der Signatur für "${self.appId}.getDocument()"` }
            }

            const currentUser = <IWorldUser>Meteor.users.findOne(this.userId);

            if (!currentUser) {
                return { status: EnumMethodResult.STATUS_NOT_LOGGED_IN, statusText: 'Sie sind nicht am System angemeldet' }
            }
            
            const currentDocument = self.findOne({_id: docId});
            if (!currentDocument) {
                return { status: EnumMethodResult.STATUS_NOT_FOUND, statusText: 'Das angegebene Dokument wurde nicht gefunden.' }
            }

            return { status: EnumMethodResult.STATUS_OKAY, document: currentDocument };
        }
    }

    private post():MethodInvocationFunction {
        const self = this;

        return function(this:{userId:string}, data:IPostProps):IMethodStatus {            
            const { docId, msg } = data;

            try {
                check(docId, String);
                check(msg, Object);
            } catch (err){
                return { status: EnumMethodResult.STATUS_SERVER_EXCEPTION, statusText: `Die angegebenen Parameter entsprechen nicht der Signatur für "${self.appId}.activities.replyTo()"` }
            }

            const currentUser = <IWorldUser>Meteor.users.findOne(this.userId);

            if (!currentUser) {
                return { status: EnumMethodResult.STATUS_NOT_LOGGED_IN, statusText: 'Sie sind nicht am System angemeldet' }
            }

            // check if doc was sharedWith the current User
            const sharedDoc = self.collection.findOne({
                $and: [
                    { _id: docId },
                    { 
                        $or: [
                            { "sharedWith.user.userId": this.userId },
                            { sharedWithRoles: { $in: currentUser.userData.roles } }
                        ]
                    }
                ]
            });
    
            if (!sharedDoc) {
                throw new Meteor.Error('Dieses Dokument wurde nicht mit Ihnen geteilt. Sie können keine Antwort verfassen.');
            }
    
            //const sharedWithRole = sharedOpinion.sharedWith.find( s => s.user.userId == this.userId );
            
            /*if (!hasPermission({ currentUser, sharedRole: sharedWithRole.role }, 'opinion.canPostMessage')) {
                throw new Meteor.Error('Keine Berechtigung zum Erstellen eines Kommentars zu einem Gutachten.');
            }*/
    
            const message = messageWithMentions({ currentUser, msg, refs: { appId: self.appId, docId }});
    
            //const post:any = injectUserData({ currentUser }, { message }, { created: true });
    
            let activity = injectUserData({ currentUser }, {
                productId: self.product.productId,
                appId: self.appId,
                docId: docId,
                type: 'USER-POST',
                message
            }, { created: true }); 
    
            try {
                ActivitySchema.validate(activity);
            } catch (err) {
                throw new Meteor.Error(err.message);
            }
            
            Activities.insert(activity);
    
            // TODO tell the author of the post that someone has answered to his post, if the answer is not from himself
            /*if ( this.userId != activity.createdBy.userId ) {
                UserActivities.insert(
                    injectUserData({ currentUser }, {
                        refUser: activity.createdBy.userId,
                        type: 'REPLYTO',
                        refs: { 
                            refOpinion, 
                            refActivity,
                            refOpinionDetail: opinionDetail && opinionDetail._id || null,
                        },
                        message: `${currentUser.userData.firstName} ${currentUser.userData.lastName} hat auf einen Post von Ihnen geantwortet.`,
                        originalContent: message,
                        unread: true
                    }, { created: true })        
                );
            }*/
                        
            return { status: EnumMethodResult.STATUS_OKAY }
        }
    }

    private activitiesReplyTo():MethodInvocationFunction {
        const self = this;

        return function(this:{userId:string}, data:IActivitiesReplyToProps):IMethodStatus {            
            const { docId, activityId, answer:msg } = data;

            try {
                check(docId, String);
                check(activityId, String);
                check(msg, Object);
            } catch (err){
                return { status: EnumMethodResult.STATUS_SERVER_EXCEPTION, statusText: `Die angegebenen Parameter entsprechen nicht der Signatur für "${self.appId}.activities.replyTo()"` }
            }

            const currentUser = <IWorldUser>Meteor.users.findOne(this.userId);

            if (!currentUser) {
                return { status: EnumMethodResult.STATUS_NOT_LOGGED_IN, statusText: 'Sie sind nicht am System angemeldet' }
            }

            //console.log(docId, activityId, msg);
            //const activity = Activities.findOne(activityId);
    
            // check if doc was sharedWith the current User
            const sharedDoc = self.collection.findOne({
                $and: [
                    { _id: docId },
                    { 
                        $or: [
                            { "sharedWith.user.userId": this.userId },
                            { sharedWithRoles: { $in: currentUser.userData.roles } }
                        ]
                    }
                ]
            });
    
            if (!sharedDoc) {
                throw new Meteor.Error('Dieses Dokument wurde nicht mit Ihnen geteilt. Sie können keine Antwort verfassen.');
            }
    
            //const sharedWithRole = sharedOpinion.sharedWith.find( s => s.user.userId == this.userId );
            
            /*if (!hasPermission({ currentUser, sharedRole: sharedWithRole.role }, 'opinion.canPostMessage')) {
                throw new Meteor.Error('Keine Berechtigung zum Erstellen eines Kommentars zu einem Gutachten.');
            }*/
    
            const message = messageWithMentions({ currentUser, msg, refs: { appId: self.appId, docId, activityId }});
    
            const answer:any = injectUserData({ currentUser }, { message }, { created: true });
    
            try {
                AnswerSchema.validate(answer);
            } catch (err) {
                throw new Meteor.Error(err.message);
            }
            
            Activities.update(activityId, {
                $push: {
                    answers: answer
                }
            });
    
            // TODO tell the author of the post that someone has answered to his post, if the answer is not from himself
            /*if ( this.userId != activity.createdBy.userId ) {
                UserActivities.insert(
                    injectUserData({ currentUser }, {
                        refUser: activity.createdBy.userId,
                        type: 'REPLYTO',
                        refs: { 
                            refOpinion, 
                            refActivity,
                            refOpinionDetail: opinionDetail && opinionDetail._id || null,
                        },
                        message: `${currentUser.userData.firstName} ${currentUser.userData.lastName} hat auf einen Post von Ihnen geantwortet.`,
                        originalContent: message,
                        unread: true
                    }, { created: true })        
                );
            }*/
                        
            return { status: EnumMethodResult.STATUS_OKAY }
        }
    }

    private lockDocument():MethodInvocationFunction {
        const self = this;

        return function(this:{userId:string,connection:Meteor.Connection}, docId: string, unlock: boolean = false):ILockResult {  
            //console.log(this.connection.id)
            try {
                check(docId, String);
                check(unlock, Boolean);
            } catch (err){
                return { status: EnumMethodResult.STATUS_SERVER_EXCEPTION, statusText: `Die angegebenen Parameter entsprechen nicht der Signatur für "${self.appId}.lock()"` }
            }

            const currentUser = <IWorldUser>Meteor.users.findOne(this.userId);

            if (!currentUser) {
                return { status: EnumMethodResult.STATUS_NOT_LOGGED_IN, statusText: 'Sie sind nicht am System angemeldet' }
            }

            return self.lock(docId, this.connection.id, unlock, currentUser);
        }
    }

    /**
     * Locks the given document for this app by the current user
     */
    protected lock(docId: string, connectionId: string, unlock: boolean, currentUser: IWorldUser): ILockResult {
        let lockId: string;

        if (unlock) {
            const islocked = this.world.locksCollection.findOne({ appId: this.appId, docId });

            // prüfen, ob sie Sperre von einem anderen benutzer
            // durchgeführt wurde
            if (islocked && (islocked.lockedBy.userId != currentUser._id || islocked.lockedBy.sessionId != connectionId)) {
                return { status: EnumMethodResult.STATUS_ABORT, statusText: 'Die Daten wurden von einem anderen Benutzer oder in einer seperaten Anmeldung gesperrt und können nicht freigegeben werden.' };
            }

            this.world.locksCollection.remove({ appId: this.appId, docId, locked: true });

            return { status: EnumMethodResult.STATUS_OKAY }
        }

        try {
            // try to lock document
            lockId = this.world.locksCollection.insert({
                appId: this.appId,
                docId,
                locked: true,
                lockedAt: new Date(),
                lockedBy: {
                    userId: currentUser._id,
                    sessionId: connectionId,
                    firstName: currentUser.userData.firstName,
                    lastName: currentUser.userData.lastName
                }
            });
        } catch(err) {
            return { status: EnumMethodResult.STATUS_SERVER_EXCEPTION, statusText: 'Fehler beim erstellen der Locks.\n' + err.message };
        }

        return {
            status: EnumMethodResult.STATUS_OKAY,
            lockId
        }
    }

    /**
     * Hinzufügen einer neuen App-Regel zur Steuerung der Prozesse
     * 
     * @param ruleId Eindeutiger Name der Rule
     * @param rule Dfinition der Regel
     */
    public addRule(ruleId: string, rule: TAppRule<T>): void {
        rule._id = ruleId;
        this.appRules.push(rule);
    }

    /**
     * Executes the defined rules
     * 
     * @param triggerTiming 
     * @param ruleProps 
     * @returns 
     */
    private async runRules(triggerTiming: TTriggerTiming, ruleProps: TAppRuleProps<T>): Promise<IMethodStatus> {
        ruleProps.triggerTiming = triggerTiming;
        
        try {
            let i=0, max=this.appRules.length
            for(i=0;i<max;i++) {
                const rule = this.appRules[i];

                if (rule.on === triggerTiming || (isArray(rule.on) && (rule.on as Array<TTriggerTiming>).find( on => on == triggerTiming))) {
                    if (rule.when === true || await rule.when(ruleProps)) {
                        await rule.then(ruleProps);
                    }
                }
            };
        } catch (err) {
            if (err instanceof AppRuleError) {
                // rethrow AppRuleError to return this as error to the caller
                throw (err);
            } else {
                return { status: EnumMethodResult.STATUS_SERVER_EXCEPTION, statusText: err.message }
            }
        }

        return { status: EnumMethodResult.STATUS_OKAY }
    }

    /**
     * Returns the current logged in user
     * for this app
     * 
     * @returns IWorlduser
     */
    private getCurrentUser(): IWorldUser {
        const userId: string | null = Meteor.userId();
        if (!userId) {
            throw new Meteor.Error('Not logged in.');
        }
        return <IWorldUser>Meteor.users.findOne(userId);
    }

    /**
     * Finds the first document specified by the selector and returns
     * the AppData as Object
     * 
     * @param selector any mongodb selector styled type
     */
    public findOne(selector:any, options?:any):AppData<T> | null {
        if (isString(selector)) {
            selector = { _id: selector }
        }

        const currentUser = this.getCurrentUser();

        const querySelector = {
            $and: [ 
                selector, {
                    $or: [
                        { "sharedWith.user.userId": currentUser._id },
                        { sharedWithRoles: { $in: currentUser.userData.roles } }
                    ]
                 }
            ]
        }

        // TODO: !!!! projection gemäß der Felder, die für den aktuellen User freigegeben sind
        return this.collection.findOne(querySelector, options);
    }

    public find(selector:any, options?:any): Mongo.Cursor<AppData<T>> {
        if (isString(selector)) {
            selector = { _id: selector }
        }

        const currentUser = this.getCurrentUser();

        const querySelector = {
            $and: [ 
                selector, {
                    $or: [
                        { "sharedWith.user.userId": currentUser._id },
                        { sharedWithRoles: { $in: currentUser.userData.roles } }
                    ]
                 }
            ]
        }

        return this.collection.find(querySelector, options);
    }

    private insertDocument():MethodInvocationFunction {
        const self = this;

        return async function(this:{userId:string}, data:InsertableAppData<T>):Promise<IGenericInsertResult> {            
            let values = data; //const { productId, appId, values } = data;

            try {
                //check(productId, String);
                //check(appId, String);
                check(values, Object);
            } catch (err){
                return { status: EnumMethodResult.STATUS_SERVER_EXCEPTION, statusText: `Die angegebenen Parameter entsprechen nicht der Signatur für "${self.appId}.insertDocument()"` }
            }

            const currentUser = <IWorldUser>Meteor.users.findOne(this.userId);

            if (!currentUser) {
                return { status: EnumMethodResult.STATUS_NOT_LOGGED_IN, statusText: 'Sie sind nicht am System angemeldet' }
            }

            let result: IGenericInsertResult;

            const { client } = MongoInternals.defaultRemoteCollectionDriver().mongo;
            const session = await client.startSession();
            await session.startTransaction();

            try {
                // running the async operations
                result = await self._insert(values as AppData<T>, currentUser, { session });
                if (result.status != EnumMethodResult.STATUS_OKAY) {
                    await session.abortTransaction();
                } else {
                    await session.commitTransaction();
                }
                // transaction committed - return value to the client
                return result;                
            } catch (err) {
                await session.abortTransaction();

                if (err instanceof AppRuleError) {
                    return { status: EnumMethodResult.STATUS_ABORT, errCode: err.name, statusText: err.message };
                }

                // transaction aborted - report error to the client
                throw new Meteor.Error('Database Transaction Failed', err.message);
            } finally {
                session.endSession();
            }
        }
    }

    /**
     * Inserts a new document for this app
     */
    protected async _insert(values: AppData<T>, currentUser: IWorldUser, options?:any): Promise<IGenericInsertResult> {
        const { namesAndMessages } = this.app

        // get Defaults and check the props for missing data
        // and setup the defaults
        if (this.app.methods && this.app.methods.defaults) {
            let result: IDefaultAppData<T>;

            try {
                result = await this.app.methods.defaults({ NEW: values, isServer: true }, { session: options?.session, moment, hasChanged: this.hasChanged(values, null), currentValue: this.currentValue(values, null) });
            } catch(err) {
                return { status: EnumMethodResult.STATUS_SERVER_EXCEPTION, statusText: 'Es ist ein Fehler beim ermitteln der Defaultwerte aufgetreten.' + err.message }
            }

            if (result.status != EnumMethodResult.STATUS_OKAY) {
                return result; //{ status: result.status, statusText: result.statusText }
            }

            // add the defaults to the values object if the specified prop is not set
            const defaultPropNames = Object.keys(result.defaults || {});
            // check if defaults are defined
            if (defaultPropNames && defaultPropNames.length > 0) {
                defaultPropNames.map ( propName => {
                    const index: keyof T = propName as unknown as keyof T;
                    // check if prop was not set by the user or input
                    if (values[index] === null || values[index] === undefined) {
                        values[index] = (result as any).defaults[index];
                    }
                });
            }
        }

        // run appRules
        let ruleResult = await this.runRules('beforeInsert', {
            _id: null,
            NEW: values, 
            OLD: null,
            session: options?.session, 
            hasChanged: this.hasChanged(values, null), 
            currentValue: this.currentValue(values, null)
        });

        if  ( ruleResult.status != EnumMethodResult.STATUS_OKAY ) {
            return ruleResult;
        }
        

        if (this.app.methods && this.app.methods.onBeforeInsert) {
            let result;

            try {
                result = await this.app.methods.onBeforeInsert(values as AppData<T>, { session: options?.session, moment, hasChanged: this.hasChanged(values, null), currentValue: this.currentValue(values, null) });
            } catch(err) {
                return { status: EnumMethodResult.STATUS_SERVER_EXCEPTION, statusText: err.message }
            }

            if (result.status == EnumMethodResult.STATUS_ABORT) {
                return { status: result.status, statusText: result.statusText }
            }
        }

        let docId: string | null = null;

        try {
            // init the revision with 1 as first version of the document
            // the initial value should always above 0 because of if(_rev)
            values._rev = 1;
            values._id = (new Mongo.ObjectID()).toHexString();
            
            // insert data to store
            const result: InsertOneWriteOpResult = await this.raw().insertOne(injectUserData({ currentUser }, values), options) as unknown as any;
            docId = result.insertedId;
            
            // Insert into activities log
            Activities.rawCollection().insertOne(
                injectUserData({ currentUser }, {
                    productId: this.app.productId,
                    appId: this.appId,
                    docId,
                    type: 'SYSTEM-LOG',
                    action: 'INSERT',
                    message: namesAndMessages.messages.activityRecordInserted || `hat ${namesAndMessages.singular.mitArtikel} erstellt`
                }, { created: true }), options
            );
        } catch(err) {
            return { status: EnumMethodResult.STATUS_SERVER_EXCEPTION, statusText: 'Fehler beim insert der Daten oder Activity\n' + err.message };
        }

        ruleResult = await this.runRules('afterInsert', {
            _id: docId,
            NEW: values, 
            OLD: null,
            session: options?.session, 
            hasChanged: this.hasChanged(values, null), 
            currentValue: this.currentValue(values, null)
        });

        if  ( ruleResult.status != EnumMethodResult.STATUS_OKAY ) {
            return ruleResult; 
        }

        if (this.app.methods && this.app.methods.onAfterInsert) {
            let result;

            try {
                result = await this.app.methods.onAfterInsert(docId as string, values, { session: options?.session, moment, hasChanged: this.hasChanged(values, null), currentValue: this.currentValue(values, null) });
            } catch(err) {
                return { status: EnumMethodResult.STATUS_SERVER_EXCEPTION, statusText: err.message }
            }

            if (result.status == EnumMethodResult.STATUS_ABORT) {
                return { status: result.status, statusText: result.statusText }
            }
        }

        return {
            status: EnumMethodResult.STATUS_OKAY,
            docId
        }
    }

    private updateDocument():MethodInvocationFunction {
        const self = this;

        return async function(this:{userId:string}, docId: string, data:UpdateableAppData<T>):Promise<IGenericUpdateResult> {            
            //const { productId, appId, docId, values } = data;
            const values = data;            

            try {
                check(docId, String);
                check(values, Object);
            } catch (err){
                return { status: EnumMethodResult.STATUS_SERVER_EXCEPTION, statusText: `Die angegebenen Parameter entsprechen nicht der Signatur für "${self.appId}.updateDocument()"` }
            }

            const currentUser = <IWorldUser>Meteor.users.findOne(this.userId);

            if (!currentUser) {
                return { status: EnumMethodResult.STATUS_NOT_LOGGED_IN, statusText: 'Sie sind nicht am System angemeldet' }
            }

            let result: IGenericUpdateResult;

            const { client } = MongoInternals.defaultRemoteCollectionDriver().mongo;
            const session = await client.startSession();
            await session.startTransaction();

            try {
                // running the async operations
                result = await self._update(docId, values, currentUser, { session });
                if (result.status != EnumMethodResult.STATUS_OKAY) {
                    await session.abortTransaction();
                } else {
                    await session.commitTransaction();
                }
                // transaction committed - return value to the client
                return result;                
            } catch (err) {
                await session.abortTransaction();

                if (err instanceof AppRuleError) {
                    return { status: EnumMethodResult.STATUS_ABORT, errCode: err.name, statusText: err.message };
                }
                
                // transaction aborted - report error to the client
                throw new Meteor.Error('Database Transaction Failed', err.message);
            } finally {
                session.endSession();
            }
        }
    }

    /**
     * Update a document for this app
    */
    protected async _update(docId: string, values: UpdateableAppData<T>, currentUser: IWorldUser, options?:any): Promise<IGenericUpdateResult> {
        let query: any = {
            $and: [
                { _id: docId },
                {
                    $or: [
                        { "sharedWith.user.userId": currentUser._id },
                        { sharedWithRoles: { $in: currentUser.userData.roles } }
                    ]
                }
            ]
        };
        if (options && options.skipPermissions) {
            query = { _id: docId }
        }

        const oldValues = <AppData<T>> await this.collection.rawCollection().findOne(query, options);

        /*
            prüfen, ob ein Record zurückgeliefert wurde. Falls dem nicht so ist, hat dies
            folgende Gründe:
            - recordID ist falsch
            - Record wurde nicht mit dem benutzer explizit geteilt
            - Benutzer hat nicht die entsprechende Rolle (geteilt)
        */
        if (!oldValues) {
            return { status: EnumMethodResult.STATUS_NOT_FOUND, statusText: 'Der Datensatz exisitiert nicht oder wurde nicht mit Ihnen geteilt.' }
        }

        let ruleResult = await this.runRules('beforeUpdate', {
            _id: docId,
            NEW: values as AppData<T>, 
            OLD: oldValues,
            session: options?.session, 
            hasChanged: this.hasChanged(values, oldValues), 
            currentValue: this.currentValue(values, oldValues)
        });

        if  ( ruleResult.status != EnumMethodResult.STATUS_OKAY ) {
            return ruleResult;
        }


        if (this.app.methods && this.app.methods.onBeforeUpdate) {
            let result: IGenericUpdateResult;

            try {
                result = await this.app.methods.onBeforeUpdate.apply(null, [docId, values, oldValues, { session: options?.session, moment, hasChanged: this.hasChanged(values, oldValues), currentValue: this.currentValue(values, oldValues) } ]);
            } catch(err) {
                return { status: EnumMethodResult.STATUS_SERVER_EXCEPTION, statusText: err.message }
            }

            if (result.status != EnumMethodResult.STATUS_OKAY) {
                return result; //{ status: result.status, statusText: result.statusText }
            }
        }

        // prüfen welche Änderungen sich ergeben haben
        const changes = this.determineChanges(values, oldValues);
        if (!changes) {
            return { 
                status: EnumMethodResult.STATUS_OKAY, 
                statusText: `Es wurden keine Änderungen durchgeführt.`,
                affectedDocs: 0
            };
        }

        let affectedDocs: number = 0;

        try {
            // update revision to get impact on client and refresh page
            // the client only reacts on the _rev changed an will update
            // the document if rev changed
            if (!oldValues._rev) values._rev = 0;
            values._rev = oldValues._rev + 1;

            // update data to store
            const updateResult: UpdateWriteOpResult = await this.collection.rawCollection().updateOne({_id:oldValues._id}, { $set: values }, options) as unknown as any;
            affectedDocs = updateResult.modifiedCount;

            // Insert into activities log
            await Activities.rawCollection().insertOne(
                injectUserData({ currentUser }, {
                    productId: this.app.productId,
                    appId: this.appId,
                    docId: oldValues._id,
                    type: 'SYSTEM-LOG',
                    action: 'UPDATE',
                    ...changes,
                }, { created: true })
            , { session: options?.session } );
        } catch(err) {
            return { status: EnumMethodResult.STATUS_SERVER_EXCEPTION, statusText: 'Fehler beim insert der Daten oder Activity\n' + err.message };
        }

        ruleResult = await this.runRules('afterUpdate', {
            _id: docId,
            NEW: values as AppData<T>, 
            OLD: oldValues,
            session: options?.session, 
            hasChanged: this.hasChanged(values, oldValues), 
            currentValue: this.currentValue(values, oldValues)
        });

        if  ( ruleResult.status != EnumMethodResult.STATUS_OKAY ) {
            return ruleResult;
        }

        if (this.app.methods && this.app.methods.onAfterUpdate) {
            let result;

            try {
                result = await this.app.methods.onAfterUpdate.apply(null, [docId, values, oldValues, { session: options?.session, moment, hasChanged: this.hasChanged(values, oldValues), currentValue: this.currentValue(values, oldValues) } ]);
            } catch(err) {
                return { status: EnumMethodResult.STATUS_SERVER_EXCEPTION, statusText: err.message }
            }
            
            if (result.status != EnumMethodResult.STATUS_OKAY) {
                return result; //{ status: result.status, statusText: result.statusText }
            }
        }

        return {
            status: EnumMethodResult.STATUS_OKAY,
            affectedDocs
        }
    }

    private removeDocument():MethodInvocationFunction {
        const self = this;

        return async function(this:{userId:string}, docId: string):Promise<IGenericRemoveResult> {            
            //const { productId, appId, docId } = data;
            
            try {
                //check(productId, String);
                //check(appId, String);
                check(docId, String);
            } catch (err){
                return { status: EnumMethodResult.STATUS_SERVER_EXCEPTION, statusText: `Die angegebenen Parameter entsprechen nicht der Signatur für "${self.appId}.removeDocument()"` }
            }

            const currentUser = <IWorldUser>Meteor.users.findOne(this.userId);

            if (!currentUser) {
                return { status: EnumMethodResult.STATUS_NOT_LOGGED_IN, statusText: 'Sie sind nicht am System angemeldet' }
            }

            let result: IGenericRemoveResult;

            const { client } = MongoInternals.defaultRemoteCollectionDriver().mongo;
            const session = await client.startSession();
            await session.startTransaction();

            try {
                // running the async operations
                result = await self._remove(docId, currentUser, { session });
                if (result.status != EnumMethodResult.STATUS_OKAY) {
                    await session.abortTransaction();
                } else {
                    await session.commitTransaction();
                }
                // transaction committed - return value to the client
                return result;                
            } catch (err) {
                await session.abortTransaction();

                if (err instanceof AppRuleError) {
                    return { status: EnumMethodResult.STATUS_ABORT, errCode: err.name, statusText: err.message };
                }

                // transaction aborted - report error to the client
                throw new Meteor.Error('Database Transaction Failed', err.message);
            } finally {
                session.endSession();
            }
        }
    }

    /**
     * Remove a document for this app
    */
    protected async _remove(docId: string, currentUser: IWorldUser, options?:any): Promise<IGenericRemoveResult> {
        let query: any = {
            $and: [
                { _id: docId },
                {
                    $or: [
                        { "sharedWith.user.userId": currentUser._id },
                        { sharedWithRoles: { $in: currentUser.userData.roles } }
                    ]
                }
            ]
        };

        if (options && options.skipPermissions) {
            query = { _id: docId }
        }
        const oldValues = <AppData<T>> await this.collection.rawCollection().findOne(query, options);

        /*
            prüfen, ob ein Record zurückgeliefert wurde. Falls dem nicht so ist, hat dies
            folgende Gründe:
            - recordID ist falsch
            - Record wurde nicht mit dem benutzer explizit geteilt
            - Benutzer hat nicht die entsprechende Rolle (geteilt)
        */
        if (!oldValues) {
            return { status: EnumMethodResult.STATUS_NOT_FOUND, statusText: 'Der Datensatz kann nicht gelöscht werden, da diser nicht exisitiert oder nicht mit Ihnen geteilt wurde.' }
        }

        let ruleResult = await this.runRules('beforeRemove', {
            _id: docId,
            NEW: null,
            OLD: oldValues,
            session: options?.session, 
            hasChanged: this.hasChanged(null, oldValues), 
            currentValue: this.currentValue(null, oldValues)
        });

        if  ( ruleResult.status != EnumMethodResult.STATUS_OKAY ) {
            return ruleResult;
        }
        

        if (this.app.methods && this.app.methods.onBeforeRemove) {
            let result;

            try {
                result = await this.app.methods.onBeforeRemove.apply(null, [oldValues, { session: options?.session, moment, hasChanged: this.hasChanged(null, oldValues), currentValue: this.currentValue(null, oldValues) } ]);
            } catch(err) {
                return { status: EnumMethodResult.STATUS_SERVER_EXCEPTION, statusText: err.message }
            }

            if (result.status != EnumMethodResult.STATUS_OKAY) {
                return result; //{ status: result.status, statusText: result.statusText }
            }
        }      

        let affectedDocs: number = 0;

        try {
            // update data to store
            const removeResult: WriteOpResult = await this.collection.rawCollection().remove({_id:oldValues._id}, options) as unknown as any;
            //console.log('Remove result:', removeResult);
            affectedDocs = removeResult.result && removeResult.result.ok;

            // Insert into activities log
            await Activities.rawCollection().insertOne(
                injectUserData({ currentUser }, {
                    productId: this.app.productId,
                    appId: this.appId,
                    docId: oldValues._id,
                    type: 'SYSTEM-LOG',
                    action: 'REMOVE',
                    changes: {
                        message:'hat das Dokument gelöscht.',
                        changes: {
                            what: 'Das gesamte Dokument wurde gelöscht.',
                            message: `Alles wurde gelöscht.`,
                            propName: '$remove',
                            oldValue: oldValues,
                            newValue: null
                        }
                    },
                }, { created: true })
            , { session: options?.session } );
        } catch(err) {
            return { status: EnumMethodResult.STATUS_SERVER_EXCEPTION, statusText: 'Fehler beim Löschen der Daten oder protokollieren der Activity\n' + err.message };
        }

        ruleResult = await this.runRules('afterRemove', {
            triggerTiming: 'afterRemove',
            _id: docId,
            NEW: null,
            OLD: oldValues,
            session: options?.session, 
            hasChanged: this.hasChanged(null, oldValues), 
            currentValue: this.currentValue(null, oldValues)
        });

        if  ( ruleResult.status != EnumMethodResult.STATUS_OKAY ) {
            return ruleResult; 
        }

        if (this.app.methods && this.app.methods.onAfterRemove) {
            let result;

            try {
                result = await this.app.methods.onAfterRemove.apply(null, [oldValues, { session: options?.session, moment, hasChanged: this.hasChanged(null, oldValues), currentValue: this.currentValue(null, oldValues) } ]);
            } catch(err) {
                return { status: EnumMethodResult.STATUS_SERVER_EXCEPTION, statusText: err.message }
            }
            
            if (result.status != EnumMethodResult.STATUS_OKAY) {
                return result; //{ status: result.status, statusText: result.statusText }
            }
        }

        return {
            status: EnumMethodResult.STATUS_OKAY,
            affectedDocs
        }
    }

    public raw() {
        return this.collection.rawCollection();
    }

    /**
     * Checks if property value has changed
     * 
     * @param NEW Values set for Update
     * @param OLD old Data values from store
     * @returns function to check Property
     */
    private hasChanged(NEW:AppData<T> | UpdateableAppData<T> | null, OLD:AppData<T> | UpdateableAppData<T> | null): (propName: keyof T) => boolean {
        const self = this;
        return function (propName: keyof T) {
            // wenn NEW und OLD null sind, dann handelt es sich um
            // den getDefaults
            if (NEW === null && OLD === null) return false;

            // wenn OLD null ist, dann handelt es sich um einen insert
            // und der Wert wurde geändert sofern ein Wert vorhanden ist
            if (OLD === null) return !!NEW && NEW[propName] !== undefined;

            // wenn NEW null ist, so handelt es sich um den remove
            // und es kann immer false zurckgegeben werden
            if (NEW === null) return false;

            // im update muss genau geprüft werden, ob sich der Wert von NEW zu OLD geändert hat
            if (NEW[propName] !== undefined) {
                // Der Wert wurde geändert bzw. "angefasst"
                // jetzt die verschiedenen Tye prüfen. Ein reiner Objektvergleich ist nicht aussreichend
                // es müssen immer die Standardtypen verglichen werden
                if ( self.app.fields[propName].type == EnumFieldTypes.ftAppLink ) {
                    
                    const  n = (NEW[propName] || []) as TAppLink,
                           o = (OLD[propName] || []) as TAppLink;
                    // für den Applink vergleichen wir zuerst die arraylänge
                    if (n.length != o.length) return true;

                    let i:number, max:number=n.length;
                    for (i=0; i < max; i++) {
                        // es wird nur die ID geprüft, die beschreibenden Felder title, description, link und imageUrl
                        // haben keine Auswirkung und dienen nur der Darstellung
                        //if (n[i]._id != o[i]._id) return true;
                        const nid = n[i]._id;
                        const fountInOld = o.find( oItem => oItem._id == nid);
                        // wurde die ID aus dem neuen Array nicht in dem alten gefunden, so 
                        // hat sich das AppLink-Feld geändert
                        if (!fountInOld) return true;
                    }
                    return false;
                }

                if ( NEW[propName] !== (OLD && OLD[propName]) ) return true;
            }

            return false;
        }
    }

    /**
     * Returns the current Value of Prop inside Updatetrigger
     * 
     * @param NEW Values set for Update
     * @param OLD old Data values from store
     * @returns function to get current Value of Prop
     */
    private currentValue(NEW:AppData<T> | UpdateableAppData<T> | null, OLD:AppData<T> | UpdateableAppData<T> | null): (propName: keyof T) => any {
        return function (propName: keyof T) {
            // wenn NEW und OLD null sind, dann handelt es sich um
            // den getDefaults
            if (NEW === null && OLD === null) return undefined;

            // wenn OLD null ist, dann handelt es sich um einen insert, Neuzugang
            if (OLD === null) return NEW && NEW[propName];

            // wenn NEW null ist, so handelt es sich um den remove
            // und es gibt nur die "alten" Werte
            if (NEW === null) return OLD[propName];

            return NEW[propName] === undefined ? OLD[propName] : NEW[propName];
        }
    }
    
    /**
     * Inserts the given document
     * 
     * @param selector currently a specific ID (string value)
     * @param values values as object to be updated
     * @returns IGenericUpdateResult
     */
     public async insertOne(values: InsertableAppData<T>, options?:any): Promise<IGenericInsertResult> {
        const currentUser = this.getCurrentUser();

        return await this._insert(values as AppData<T>, currentUser, options);
    }

    /**
     * Updates the given document by ID
     * 
     * @param selector currently a specific ID (string value)
     * @param values values as object to be updated
     * @returns IGenericUpdateResult
     */
    public async updateOne(id: string, values: UpdateableAppData<T>, options?:any): Promise<IGenericUpdateResult> {
        const currentUser = this.getCurrentUser();

        return await this._update(id, values, currentUser, options);
    }

    /**
     * Removes the given document by ID
     * 
     * @param id specific ID of document (string value)
     * @param options MONGO options like session
     * @returns IGenericRemoveResult
     */
    public async removeOne(id: string, options?:any): Promise<IGenericRemoveResult> {
        const currentUser = this.getCurrentUser();

        return await this._remove(id, currentUser, options);
    }

    /**
     * Determine changes between old and newData object by the given propList
     * and returns an Array of changes
     * 
     * @param {Object}  param0.propList Object that lists all props to determine "propName: { what, msg }"
     *                  param0.data Dataobject with the new data to inspect
     *                  param0.oldData Dataobject with the old data
     * @returns {Array} Array of Objects { what, message, propName, oldValue, newValue }
     */
    private determineChanges = ( data: AppData<T> | UpdateableAppData<T>, oldData: AppData<T> ): IChanges | null => {
        function arrayToText(a: Array<string>) {
            if (a.length <= 2) {
                return a.join(' und ');
            } else {
                return a.slice(0, -1).join(', ') + ' und ' + a[a.length - 1];
            }
        }

        let changes: TAppDataChanges = [];

        const fields = Object.keys(this.app.fields);
        fields.forEach( pn => {
            const fieldName = pn as keyof T;
            const { namesAndMessages } = this.app.fields[fieldName];

            let hasChanged: boolean = false;
            
            if (this.app.fields[fieldName].type == EnumFieldTypes.ftAppLink) {
                
                if (data[fieldName] === undefined /*&& oldData[fieldName] === undefined*/) {
                    // wenn newData-Objekt undefined ist, so wurde das Feld im Update nicht berücksichtigt
                    // somit ist es nicht verändert worden
                    hasChanged = false
                } else {
                    if (
                        (data[fieldName] !== undefined && (oldData[fieldName] === undefined || oldData[fieldName] === null)) ||
                        ((data[fieldName] === undefined || oldData[fieldName] === null) && oldData[fieldName] !== undefined )
                    ) {
                        hasChanged = true
                    } else {
                        const n = data[fieldName] as unknown as TAppLink;
                        const o = oldData[fieldName] as unknown as TAppLink;
                        if (n.length != o.length) {
                            hasChanged = true
                        } else {
                            // old und newdata weise Daten auf, nun auf Feldebene vergleichen
                            (data[fieldName] as unknown as TAppLink).forEach((d, i) => {
                                if (!hasChanged){
                                    const oldD = (oldData[fieldName] as unknown as TAppLink)[i];
                                    ['_id', 'title', 'desciption', 'link', 'imageUrl'].forEach( (prop: string) => {
                                        if ((d as any)[prop] !== (oldD && (oldD as any)[prop])) {
                                            hasChanged = true
                                        }
                                    })
                                }
                            });
                        }
                    }
                }
            } else {
                // prüfung für Datespan Array of dates
                if (isArray(data[fieldName]) && isArray(oldData[fieldName])) {
                    const nData = data[fieldName] as unknown as Array<any>;
                    const oData = oldData[fieldName] as unknown as Array<any>;

                    if (nData.length != oData.length) {
                        hasChanged = true;
                    } else {
                        nData.forEach( (a, i) => {
                            if (a.toString() != oData[i].toString()) hasChanged = true;
                        })
                    }
                } else {
                    hasChanged = data[fieldName] !== undefined && data[fieldName] !== oldData[fieldName];
                }
            }            

            if (hasChanged) {
                changes.push({
                    what: namesAndMessages.messages.onUpdate,
                    message: `${namesAndMessages.singular.mitArtikel} wurde geändert.`,
                    propName: pn,
                    oldValue: oldData[fieldName],
                    newValue: data[fieldName]
                });
            }
        });

        if (changes.length == 0) 
            return null;

        return {
            message: "hat " + arrayToText(changes.map( ({ what }) => what)) + " geändert.",
            changes
        }
    }
}