import { Meteor, Subscription } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import { EnumMethodResult } from '/imports/api/consts';
import { Product } from './product';
import { IApp, IAppMethodResult, IAppresult, IAppsresult, IGetReportResult } from '/imports/api/types/app-types';
import { MethodInvocationFunction } from './types';

import { IWorld, IWorldUser, IProduct, IProductresult, IProductsresult, IClientCollectionResult, TReport, ILoginDefiniton, IMethodStatus } from '/imports/api/types/world';
import { ProductSchema, AppSchema, ReportSchema, LockSchema } from './schemas';
import { Report } from './report';
import { check } from 'meteor/check';
import { Avatars } from './avatars';

//import { MongoInternals, InsertOneWriteOpResult, UpdateWriteOpResult, WriteOpResult } from 'meteor/mongo';
import * as SuperMongo from "meteor/mongo";
import { userHasOneOrMoreRequiredRole } from './security';
import SimpleSchema from 'simpl-schema';
import { Accounts } from 'meteor/accounts-base';
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


export interface IDocumentLock {
    _id: string
    appId: string
    docId: string
    locked: boolean
    lockedBy: {
        userId: string
        sessionId: string
        firstName: string
        lastName: string 
    }
    lockedAt: Date
}

export interface ILoginDefinitonResult extends IMethodStatus {
    loginDefinition?: ILoginDefiniton
}

export interface IRegisterUserData {
    email: string
    password: string
    password1?: string
    gender: string
    firstName: string
    lastName: string
    company: string
    street: string
    postalcode: string
    city: string
    countryCode: string
    agbs: boolean
}

export interface IRegisterResult extends IMethodStatus {
    userId?: string
}

export class World {
    public worldCollection: Mongo.Collection<IWorld>;
    public productCollection: Mongo.Collection<IProduct>;
    public appCollection: Mongo.Collection<IApp<any>>;
    public reportCollection: Mongo.Collection<TReport<any, any>>;

    public locksCollection: Mongo.Collection<IDocumentLock>;

    private worldId: string = '';
    private worldDef: IWorld | null = null;

    constructor(worldDef: IWorld) {

        this.worldCollection = new Mongo.Collection('__worldData');
        this.productCollection = new Mongo.Collection('__productData');
        this.productCollection.attachSchema(ProductSchema);
        this.appCollection = new Mongo.Collection('__appData');
        this.appCollection.attachSchema(AppSchema);
        this.reportCollection = new Mongo.Collection('__reportData');
        this.reportCollection.attachSchema(ReportSchema);

        this.locksCollection = new Mongo.Collection('__locks');
        this.locksCollection.attachSchema(LockSchema);
        this.locksCollection.createIndex({
            appId: 1,
            docId: 1
        }, { name:'lock-document', unique: true });

        [
            this.worldCollection,
            this.productCollection, 
            this.appCollection,

            this.reportCollection,
            this.locksCollection
        ].map( collection => {
            // remove all previous defined worlds, products, apps and reports
            collection.remove({});

            collection.allow ({
                insert() { return false; },
                update() { return false; },
                remove() { return false; },
            });
        });

        this.createWorld(worldDef);

        this.registerWorldMethods();

        Meteor.publish('__avatar', function publishAvatar(this:Subscription, userId: string) {
            if (!userId)
                return this.ready();

            check(userId, String);

            const currentUser = <IWorldUser>Meteor.users.findOne(<string>this.userId);
        
            if (!currentUser)
                return this.ready();

            return Avatars.find({_id: userId}).cursor;
        });

        Meteor.publish('__world.userprofile', function userProfile(this:Subscription, userId: string) {
            if (!userId) return this.ready();

            check(userId, String);

            // TODO Check Permissions who could take a look at the user-profile
            return Meteor.users.find({_id: userId}, {fields: {userData:1}});
        });

        Meteor.onConnection( (connection) => {
            connection.onClose( () => {
                // locks aufheben, wenn die Connection beendet wird
                this.locksCollection.remove({ 'lockedBy.sessionId' : connection.id })
            });
        });
    }

    private createWorld( worldDef: IWorld ):string{
        this.worldDef = worldDef;
        this.worldId = this.worldCollection.insert(worldDef);

        return this.worldId;
    }

    public createProduct( productDef: IProduct ): Product {
        return new Product(this, productDef);
    }

    public createReport<T, Parent>( reportId: string, reportDef: TReport<T, Parent>): Report {
        reportDef._id = reportId;
        return new Report(this, reportDef);
    }

    /**
     * Register all neccessary Meteor Methods to get 
     * productData for the client
     * 
     */
    private registerWorldMethods() {
        this.getProduct();
        
        Meteor.methods({
            '__world.registerUser': this.registerUser(),
            '__world.checkUserByEMailAlreadyInUse': this.checkUserByEMailAlreadyInUse(),
            '__world.sendVerificationEmail': this.sendVerificationEmail(),
            '__world.sendForgotPasswordMail': this.sendForgotPasswordMail(),
            '__world.checkResetPasswordToken': this.checkResetPasswordToken(),
            '__worldData.getLoginDefinition': this.getLoginDefinition(),
            '__productData.getProduct': this.getProduct(),
            '__productData.getProducts': this.getProducts(),
            '__appData.getApp': this.getApp(),
            '__appData.getApps': this.getApps(),
            '__appData.getAppsByProduct': this.getAppsByProduct(),
            '__appData.clientCollectionInit': this.clientCollectionInit(),
            '__reportData.getReport': this.getReport(),
        });
    }

    /**
     * Register a new User for the system
     * 
     * @param productId Id of the requested product
     * @returns Metadata of product
     */
     private registerUser():MethodInvocationFunction {
        const self = this;
        const UserSchema = new SimpleSchema({
            email: { type: String },
            password: { type: String },
            gender: { type: String },
            firstName: { type: String },
            lastName: { type: String },
            company: { type: String },
            street: { type: String },
            postalcode: { type: String },
            city: { type: String },
            countryCode: { type: String },
            agbChecked: { type: Boolean },
            datenschutzChecked: { type: Boolean },
        });
        
        return function(this:{userId:string}, data:IRegisterUserData):IRegisterResult  { 
            try {
                UserSchema.validate(data);
            } catch (err) {
                return { status: EnumMethodResult.STATUS_SERVER_EXCEPTION, statusText: 'Die eingehenden Daten entsprechen nicht der Signatur für registerUser().' }
            }

            if (Accounts.findUserByEmail(data.email)){
                return { 
                    status: EnumMethodResult.STATUS_ABORT, 
                    statusText: 'Der Benutzer konnte nicht erstellt werden, da die E-Mailadresse bereits verwandt wird. Wenn Sie Ihr Passwort vergessen haben, so nutzen Sie die "Passwort vergessen" Option.' 
                }
            }

            let userId;
            try {
                userId = Accounts.createUser({ email: data.email, password: data.password });
            } catch(err) {
                return { status: EnumMethodResult.STATUS_SERVER_EXCEPTION, statusText: 'Der geforderte Benutzer konnte nicht erstellt werden. ' + err.message }
            }

            let userProfile: Partial<IRegisterUserData> = { ...data };
            delete userProfile.email;
            delete userProfile.password;

            try {
                // after creating the new user we have to update the individual userData
                Meteor.users.update({ _id: userId }, {
                    $set: {
                        userData: {
                            roles: self.worldDef?.register?.initialRoles,
                            ...userProfile,
                            accountVerified: false
                        }
                    }
                });
            } catch(err) {
                return { status: EnumMethodResult.STATUS_SERVER_EXCEPTION, statusText: 'Die Speicherung des Benutzerprofiles war nicht möglich. ' + err.message }
            }

            Accounts.sendVerificationEmail(userId, data.email);

            return { status: EnumMethodResult.STATUS_OKAY, userId }
        }
    }

    
    /**
     * Check if the given E-Mail-address is alread in use
     * 
     * @returns IMethodStatus
     */
     private checkUserByEMailAlreadyInUse():MethodInvocationFunction {
        return function(this:{userId:string}, email: string):IMethodStatus  {                 
            try {
                check(email, String);
            } catch(err) {
                return { status: EnumMethodResult.STATUS_SERVER_EXCEPTION, statusText: 'Die Eingabe entspricht nicht der erwarteten Signatur für sendForgotPasswordMail().'};
            }

            if (!email) {
                return { status: EnumMethodResult.STATUS_ABORT, statusText: 'Bitte geben Sie eine E-Mailadresse an.'};
            }

            try {
                const user = Accounts.findUserByEmail(email);
                if (user) {
                    return { status: EnumMethodResult.STATUS_ABORT, statusText: 'Die angegebene E-Mailadresse existiert bereits.' }
                }
            } catch(err) {
                return { status: EnumMethodResult.STATUS_SERVER_EXCEPTION, statusText: err.name + ': ' + err.message};
            }

            return { status: EnumMethodResult.STATUS_OKAY }
        }
    }

    /**
     * sendVerificationEmail
     * 
     * @returns IMethodStatus
     */
     private sendVerificationEmail():MethodInvocationFunction {
        return function(this:{userId:string}):IMethodStatus  {           
            if (!this.userId) {
                return { status: EnumMethodResult.STATUS_NOT_LOGGED_IN, statusText: 'Die E-Mail konnte nicht versandt werden, da keine Anmeldeinformationen vorliegen.' }
            }
            Accounts.sendVerificationEmail(this.userId);
            
            return { status: EnumMethodResult.STATUS_OKAY }
        }
    }

    /**
     * Sends an EMail to the users mail with a token to rest the passwort
     * 
     * @param email EMail addree of the target user
     * @returns Methodstatus
     */
     private sendForgotPasswordMail():MethodInvocationFunction {
        return function(this:{userId:string}, email:string): IMethodStatus  {
            try {
                check(email, String);
            } catch(err) {
                return { status: EnumMethodResult.STATUS_SERVER_EXCEPTION, statusText: 'Die Eingabe entspricht nicht der erwarteten Signatur für sendForgotPasswordMail().'};
            }

            if (this.userId) {
                return { status: EnumMethodResult.STATUS_ABORT, statusText: 'Die E-Mail konnte nicht versandt werden, da noch eine angemeldete Sitzung existiert.' }
            }
            
            const user = Accounts.findUserByEmail(email);
            if (!user) {
                return { status: EnumMethodResult.STATUS_ABORT, statusText: 'Die angegebene E-Mailadresse ist nicht bekannt.' }
            }

            try {
                Accounts.sendResetPasswordEmail(user._id, email);
            } catch(err) {
                return { status: EnumMethodResult.STATUS_ABORT, statusText: err.message};
            }

            return { status: EnumMethodResult.STATUS_OKAY }
        }
    }
    
    /**
     * Checks the given toke to be valid or not
     * 
     * @param token The token send by mail from method sendForgotPasswordMail
     * @returns Methodstatus
     */
     private checkResetPasswordToken():MethodInvocationFunction {
        return function(this:{userId:string}, token:string): IMethodStatus  {
            try {
                check(token, String);
            } catch(err) {
                return { status: EnumMethodResult.STATUS_SERVER_EXCEPTION, statusText: 'Die Eingabe entspricht nicht der erwarteten Signatur für checkResetPasswordToken().'};
            }

            if (this.userId) {
                return { status: EnumMethodResult.STATUS_ABORT, statusText: 'Die E-Mail konnte nicht versandt werden, da noch eine angemeldete Sitzung existiert.' }
            }
            
            const checkToken = Meteor.users.findOne({'services.password.reset.token' : token });

            if (!checkToken) {
                return { status: EnumMethodResult.STATUS_ABORT, statusText: 'Der angegebene Token ist nicht gültig. Bitte überprüfen Sie Ihre Eingabe.' }
            }

            return { status: EnumMethodResult.STATUS_OKAY }
        }
    }

    /**
     * Get the meta data of the Login-Section
     * 
     * @param productId Id of the requested product
     * @returns Metadata of product
     */
     private getLoginDefinition():MethodInvocationFunction {
        const self = this;

        return function(this:{userId:string}):ILoginDefinitonResult  {           
            if (!self.worldDef) {
                return { status: EnumMethodResult.STATUS_SERVER_EXCEPTION, statusText: 'Es ist eine Definition auf dem Server vorhanden.' }
            }
            return { status: EnumMethodResult.STATUS_OKAY, loginDefinition: self.worldDef.login }
        }
    }

    /**
     * Get the meta data of the specified product
     * 
     * @param productId Id of the requested product
     * @returns Metadata of product
     */
    private getProduct():MethodInvocationFunction {
        const Products = this.productCollection;

        return function(this:{userId:string, unblock:()=>void}, productId: string):IProductresult {
            this.unblock();
            const currentUser = <IWorldUser>Meteor.users.findOne(this.userId);
            
            if (!currentUser)
                return { status: EnumMethodResult.STATUS_NOT_LOGGED_IN, statusText: 'You are not logged in.' };
        
            const product = <IProduct>Products.findOne({
                $and: [
                    { _id: productId },
                    {
                        $or: [
                            { "sharedWith.user.userId": currentUser._id },
                            { sharedWithRoles: { $in: currentUser.userData.roles } }
                        ]        
                    }
                ]
            }); 
            
            if (!product) { 
                return { status: EnumMethodResult.STATUS_NOT_FOUND, statusText: `The product with the id "${productId}" was not found.` };
            }

            return { status: EnumMethodResult.STATUS_OKAY, product }
        }
    }

    /**
     * Get the meta data of all products the current
     * user is permitted to
     * 
     * @returns Metadata of all products
     */
    private getProducts():MethodInvocationFunction {
        const Products = this.productCollection;

        return function(this:{userId:string}):IProductsresult {
            const currentUser = <IWorldUser>Meteor.users.findOne(this.userId);

            if (!currentUser)
                return { status: EnumMethodResult.STATUS_NOT_LOGGED_IN, statusText: 'You are not logged in.' };
            
            const products = <Array<IProduct>>Products.find({
                $or: [
                    { "sharedWith.user.userId": currentUser._id },
                    { sharedWithRoles: { $in: currentUser.userData.roles } }
                ]        
            }, { sort: { position: 1, title: 1 } }).fetch();
            
            return { status: EnumMethodResult.STATUS_OKAY, products }
        }
    }

    /**
     * Get the Metadata of the specified app
     * @returns Metadata of app
     */
    private getApp():MethodInvocationFunction {
        const Apps = this.appCollection;

        return function(this:{userId:string, unblock:()=>void}, appId:string):IAppresult<any> {
            this.unblock();

            const currentUser = <IWorldUser>Meteor.users.findOne(this.userId);

            if (!currentUser)
                return { status: EnumMethodResult.STATUS_NOT_LOGGED_IN, statusText: 'You are not logged in.' };

            const app = Apps.findOne({
                $and: [
                    { _id: appId },
                    {
                        $or: [
                            { "sharedWith.user.userId": currentUser._id },
                            { sharedWithRoles: { $in: currentUser.userData.roles } }
                        ]
                    }
                ]
            });
            
            if (!app) { 
                return { status: EnumMethodResult.STATUS_NOT_FOUND, statusText: `The app with the id "${appId}" was not found.` };
            }

            // rausfilteren der actions, die für den aktuellen Benutzer möglich sind
            const appActions = { ...app.actions };
            const actionCodes = Object.keys(appActions);
            
            app.actions = {}
            actionCodes.forEach( code => {
                const action = appActions[code];
                if (userHasOneOrMoreRequiredRole(currentUser.userData.roles, appActions[code].visibleBy)) {
                    app.actions[code] = action
                }
            });
            


            return { status: EnumMethodResult.STATUS_OKAY, app }
        }
    }

    /**
     * Get the Metadata of all app's the user is shared with
     * @returns Metadata of apps
     */
    private getApps():MethodInvocationFunction {
        const Apps = this.appCollection;

        return function(this:{userId:string}):IAppsresult<any> {
            const currentUser = <IWorldUser>Meteor.users.findOne(this.userId);

            if (!currentUser)
                return { status: EnumMethodResult.STATUS_NOT_LOGGED_IN, statusText: 'You are not logged in.' };

            const apps = <Array<IApp<any>>>Apps.find({
                $or: [
                    { "sharedWith.user.userId": currentUser._id },
                    { sharedWithRoles: { $in: currentUser.userData.roles } }
                ]
            }).fetch();

            return { status: EnumMethodResult.STATUS_OKAY, apps }
        }
    }

    /**
     * Get the Metadata of all app's by the given product the user is shared with
     * @returns Metadata of apps
     */
    private getAppsByProduct():MethodInvocationFunction {
        const Apps = this.appCollection;

        return function(this:{userId:string}, productId: string):IAppsresult<any> {
            const currentUser = <IWorldUser>Meteor.users.findOne(this.userId);

            if (!currentUser)
                return { status: EnumMethodResult.STATUS_NOT_LOGGED_IN, statusText: 'You are not logged in.' };

            const apps = <Array<IApp<any>>>Apps.find({
                $and: [
                    { productId: productId },
                    {
                        $or: [
                            { "sharedWith.user.userId": currentUser._id },
                            { sharedWithRoles: { $in: currentUser.userData.roles } }
                        ]
                    }
                ]
            }, {sort: {position:1, title:1}}).fetch();
            
            return { status: EnumMethodResult.STATUS_OKAY, apps }
        }
    }

    /**
     * Get all App-Ids to init the mongos client collections
     * @returns Metadata of apps
     */
     private clientCollectionInit():MethodInvocationFunction {
        const Apps = this.appCollection;

        return function(this:{userId:string}):IClientCollectionResult {
            const appIds: Array<string|undefined> = Apps.find({}, { fields: { _id: 1 }}).map( ({ _id }) => <string>_id );
    
            return { status: EnumMethodResult.STATUS_OKAY, appIds: appIds as Array<string> }
        }
    }


    /**
     * Get all Metadata by the given reportId
     * @returns Metadata of report
     */
     private getReport():MethodInvocationFunction {
        const Reports = this.reportCollection;

        return function(this:{userId:string}, reportId: string):IGetReportResult {
            check(reportId, String);
            
            const report = Reports.findOne({ _id: reportId });
            
            return { status: EnumMethodResult.STATUS_OKAY, report }
        }
    }

    public async runTransaction(transactionHandler:(session:any)=>Promise<IAppMethodResult>): Promise<IAppMethodResult> {

        const { client } = MongoInternals.defaultRemoteCollectionDriver().mongo;
        const session = await client.startSession();
        await session.startTransaction();

        try {
            // running the async operations
            const result = await transactionHandler(session);
            if (result.status != EnumMethodResult.STATUS_OKAY) {
                await session.abortTransaction();
            } else {
                await session.commitTransaction();
            }
            // transaction committed - return value to the caller
            return result;
        } catch (err) {
            await session.abortTransaction();

            console.error(err.message);
            // transaction aborted - report error to the client
            throw new Meteor.Error('Database Transaction Failed', err.message);
        } finally {
            session.endSession();
        }
    }

}