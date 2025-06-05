import { Meteor } from 'meteor/meteor';
//import { Mongo } from 'meteor/mongo';
import { useTracker } from 'meteor/react-meteor-data';
import { useEffect, useState } from 'react';
import { EnumDocumentModes, EnumFieldTypes, EnumMethodResult } from '/imports/api/consts';
import { getAppStore, IGenericDocument } from '/imports/api/lib/core';
import { AppData, IApp, IAppresult, IAppsresult, IDefaultAppData } from '/imports/api/types/app-types';

import { Activities } from '/imports/api/lib/activities';

import moment from 'moment';

import { IProductresult, IProductsresult, IUserData, IWorldUser } from '/imports/api/types/world';
import { isArray, isDate } from '/imports/api/lib/basics';
import { Avatars } from '/imports/api/lib/avatars';
import { IDocumentLock, ILoginDefinitonResult } from '/imports/api/lib/world';
import { useStateWithDeps } from 'use-state-with-deps';


/**
 * Reactive current User Account
 */
 export const useAccount = () => useTracker(() => {
    const user = Meteor.user();
    const userId:string|null = Meteor.userId();

    const subscription = Meteor.subscribe('currentUser');
    let currentUser = null;

    if (subscription.ready()) {
        currentUser = Meteor.users.findOne({_id:<string>userId}, { fields: { username: 1, services:1, emails:1, userData: 1 }}) as IWorldUser;
    }

    let isNotVerified = true;
    if (currentUser?.services.password) {
        // wenn es das emails property nicht gibt, aber dafür den username, dann handelt es sich um einen "Admin-User"
        // mit festem Benutzernamen und ohne E-Mail => also keine Verification erforderlich für eine Mailadresse
        if (!currentUser.emails && currentUser.username) {
            isNotVerified = false;
        } else {
            if (currentUser?.emails?.filter( ({ verified }) => verified === false ).length === 0) {
                isNotVerified = false
            }
        }
    } else if (currentUser?.services?.google) {
        isNotVerified = !currentUser?.services.google.verified_email
    }

    return {
        user,
        userId,
        currentUser,
        isLoggedIn: !!userId,
        accountVerified: (isNotVerified === false),
        accountsReady: user !== undefined && subscription.ready()
    }
}, []);

/**
 * Loads the Definition for the Login-Page
 * 
 */
 export const useLoginDefinition = () => {
    const [ loginDefinition, setLoginDefinition ] = useState<ILoginDefinitonResult>({
        status: EnumMethodResult.STATUS_LOADING,
    });

    useEffect(() => {
        Meteor.call('__worldData.getLoginDefinition', (err: Meteor.Error, result: ILoginDefinitonResult) => {
            if (err) {
                setLoginDefinition({
                    status: EnumMethodResult.STATUS_SERVER_EXCEPTION,
                    statusText: 'Ein unerwarteter Fehler ist aufgetreten.\n' + err.error + ' ' + err.message,
                });
            } else {
                setLoginDefinition(result)
            }
        });
    }, []);

    return loginDefinition;
};

/**
 * Load the Products that are shared with the current user
 * 
 * @param {String} userId   Specifies the user
 */
export const useProducts = () => {
    const [ productData, setProductData ] = useState<IProductsresult>({
        status: EnumMethodResult.STATUS_LOADING, 
    });

    if (!Meteor.user()) {
        const productState = {
            status: EnumMethodResult.STATUS_NOT_LOGGED_IN,
            statusText: 'Sie sind nicht angemeldet und haben keinen Zugriff auf das angegebene Modul.'
        }
        setProductData(productState);
    }
    
    useEffect(() => {
        let unmounted = false;

        Meteor.call('__productData.getProducts', (err: Meteor.Error, result: IProductsresult) => {
            if (err) {
                const productState = {
                    status: EnumMethodResult.STATUS_SERVER_EXCEPTION,
                    statusText: 'Ein unerwarteter Fehler ist aufgetreten.\n' + err.error + ' ' + err.message
                }
                if (!unmounted) setProductData(productState)
            } else {
                if (!unmounted) setProductData(result)
            }
        });

        return () => { unmounted = true };
    }, []);

    return productData;
};

/**
 * Lese das angegeben Produkt für den aktuellen Benutzer
 * 
 * @param {String} userId   Specifies the user
 */
export const useProduct = (productId: string):IProductresult => {
    const [ productData, setProductData ] = useStateWithDeps<IProductresult>({
        status: EnumMethodResult.STATUS_LOADING,
    }, [productId]);
    
    if (!Meteor.user()) {
        const newtState = {
            status: EnumMethodResult.STATUS_NOT_LOGGED_IN,
            statusText: 'Sie sind nicht angemeldet und haben keinen Zugriff auf das angegebene Modul.'
        }
        setProductData(newtState);
    }
    
    useEffect(() => {
        let unmounted = false;

        Meteor.call('__productData.getProduct', productId, (err: Meteor.Error, result: IProductresult) => {
            if (err) {
                if (!unmounted) setProductData({
                    status: EnumMethodResult.STATUS_SERVER_EXCEPTION,
                    statusText: 'Ein unerwarteter Fehler ist aufgetreten.\n' + err.error + ' ' + err.message
                })
            } else {
                if (!unmounted) setProductData(result)
            }
        });

        return () => { unmounted = true };
    }, [productId]);

    return productData;
};

/**
 * Lese der AppMeta-Data für die angegeben App-Id
 * 
 * @param {String} appId   Specifies the app
 */
 export const useApp = (appId: string):IAppresult<any> => {   
    const [ appsData, setAppsData ] = useStateWithDeps<IAppresult<any>>({
        status: EnumMethodResult.STATUS_LOADING, 
    }, [appId]);
    
    if (!Meteor.user()) {
        const newState = {
            status: EnumMethodResult.STATUS_NOT_LOGGED_IN,
            statusText: 'Sie sind nicht angemeldet und haben keinen Zugriff auf die angegebene App.'
        }
        setAppsData(newState);
    }
    
    useEffect(() => {
        let unmounted = false;

        Meteor.call('__appData.getApp', appId, (err: Meteor.Error, result: IAppresult<any>) => {
            if (err) {
                const newState = {
                    status: EnumMethodResult.STATUS_SERVER_EXCEPTION,
                    statusText: 'Ein unerwarteter Fehler ist aufgetreten.\n' + err.error + ' ' + err.message
                }
                if (!unmounted) setAppsData(newState)
            } else {
                let { app } = result;

                let dashboardPicker = () => { return 'default' }
                if ( app && app.dashboardPicker) {
                    app.dashboardPicker = eval(<string>app.dashboardPicker);
                } else if (app && !app.dashboardPicker) {
                    app.dashboardPicker = dashboardPicker
                }
                
                if (!unmounted) setAppsData(result)
            }
        });

        return () => { unmounted = true };
    }, [appId]);

    return appsData;
};

/**
 * Lese alle Module zu einem bestimmten Produkt
 * 
 * @param {String} userId   Specifies the user
 */
export const useAppsByProduct = (productId: string) => {   
    const [ appsData, setAppsData ] = useState<IAppsresult<unknown>>({
        apps: null, 
        status: EnumMethodResult.STATUS_LOADING, 
    });

    if (!Meteor.user()) {
        const newState = {
            apps: null,
            status: EnumMethodResult.STATUS_NOT_LOGGED_IN,
            statusText: 'Sie sind nicht angemeldet und haben keinen Zugriff auf das angegebene Modul.'
        }
        setAppsData(newState);
    }
    
    useEffect(() => {
        let unmounted = false;

        Meteor.call('__appData.getAppsByProduct', productId, (err: Meteor.Error, result: IAppsresult<unknown>) => {
            if (err) {
                const newState = {
                    apps: null,
                    status: EnumMethodResult.STATUS_SERVER_EXCEPTION,
                    statusText: 'Ein unerwarteter Fehler ist aufgetreten.\n' + err.error + ' ' + err.message
                }
                if (!unmounted) setAppsData(newState)
            } else {
                if (!unmounted) setAppsData(result)
            }
        });

        return () => { unmounted = true };
    }, [productId]);

    return appsData;
};


export interface IProfileResult {
    profile?: IUserData,
    status: EnumMethodResult,
    statusText?: string
}

/** 
 * Lesen des angegeben Userprofiles
 */
 export const useProfile = (userId: string) => useTracker<IProfileResult>( () => {
    if (!Meteor.user()) {
        return {
            status: EnumMethodResult.STATUS_NOT_LOGGED_IN,
            statusText: 'Sie sind nicht angemeldet und haben keinen Zugriff auf das angegebene Profil.'
        };
    }

    const handler = Meteor.subscribe('__world.userprofile', userId);

    if (!handler.ready()) { 
        return {
            status: EnumMethodResult.STATUS_LOADING
        };
    }

    const profile = Meteor.users.findOne({_id: userId}, { fields: { userData:1 }}) as IWorldUser;
    if (!profile) {
        return {
            status: EnumMethodResult.STATUS_NOT_FOUND,
            statusText: 'Das angegebene Profil wurde nicht gefunden oder wurde nicht mit Ihnen geteilt.'
        };
    }

    return {
        profile: profile.userData,
        status: EnumMethodResult.STATUS_OKAY,
    };
}, [userId]);


export interface IDocumentResult {
    doc?: AppData<any>,
    status: EnumMethodResult,
    statusText?: string
}
/** 
 * Lesen des angegeben Datensatzes
 * für die angegebene App
 */
export const useDocument = (appId: string, docId: string) => useTracker<IDocumentResult>( () => {
    if (!appId || !docId) return {
        status: EnumMethodResult.STATUS_ABORT,
        statusText: 'Fehlende Parameter oder fehlerhafte Signatur für die Verwendung von useDocument().'
    };

    if (!Meteor.user()) {
        return {
            status: EnumMethodResult.STATUS_NOT_LOGGED_IN,
            statusText: 'Sie sind nicht angemeldet und haben keinen Zugriff auf das angegebene Dokument.'
        };
    }

    const appStore = getAppStore(appId);

    const handler = Meteor.subscribe('__app.' + appId + '.document', { docId });

    if (!handler.ready()) { 
        return { status: EnumMethodResult.STATUS_LOADING };
    }

    const doc = appStore.findOne(docId);

    // prüfen ob ein document gefunden wurde
    // ggf. ist das Produkt oder Modul nicht mit dem angemeldeten Benutzer
    // geteilt und somit besteht auch kein Zugriff auf den eigentlichen Datensatz
    if (!doc) return {
        status: EnumMethodResult.STATUS_NOT_FOUND,
        statusText: 'Das geforderte Dokument wurde nicht gefunden oder ist nicht mit Ihnen geteilt.'
    };

    // transform Date to moment
    doc && Object.keys(doc).forEach((propName:string) => {
        const v:any = doc[propName];
        if (v && isDate(v)) {
            doc[propName] = moment(v);
        } else if (v && isArray(v) && v.length > 0 && isDate(v[0])) {
            v[0] = moment(v[0]);
            v[1] = moment(v[1]);

            doc[propName] = v;
        }
    });

    return {
        doc, status: EnumMethodResult.STATUS_OKAY 
    };
}, [appId, docId]);



export interface ILockResult {
    lock?: IDocumentLock,
    status: EnumMethodResult,
    statusText?: string
}

/** 
 * Lesen des aktuellen Lockstatus für das angegeben Dokument und
 * für die angegebene App
 */
export const useDocumentLock = (/*mode:EnumDocumentModes,*/ appId: string, docId: string) => useTracker<ILockResult>( () => {
    /*if ( mode == EnumDocumentModes.NEW ) {
        return { status: EnumMethodResult.STATUS_OKAY }
    }*/
    
    if (!appId || !docId) return {
        status: EnumMethodResult.STATUS_ABORT,
        statusText: 'Fehlende Parameter oder fehlerhafte Signatur für useDocumentLock().'
    };

    if (!Meteor.user()) {
        return {
            status: EnumMethodResult.STATUS_NOT_LOGGED_IN,
            statusText: 'Sie sind nicht angemeldet und haben keinen Zugriff auf die Lock-Statistik des angegebene Dokuments.'
        };
    }

    const lockStore = getAppStore('__locks');

    const handler = Meteor.subscribe('__app.' + appId + '.islocked', docId );

    if (!handler.ready()) { 
        return { status: EnumMethodResult.STATUS_LOADING };
    }

    const lock = lockStore.findOne({ appId, docId });

    return {
        lock, status: EnumMethodResult.STATUS_OKAY
    };
}, [appId, docId]);


/** 
 * Lesen des Defaults für ein Dokument der angegebenen App
 */
export const useDocumentDefaults = (app: IApp<any> | undefined, queryParams: { [key:string]:any }) => {
    const appId = (app && app._id) || 'undefined';

    const [ defaultData, setDefaultData ] = useStateWithDeps<IDefaultAppData<any>>({
        status: EnumMethodResult.STATUS_LOADING, 
    }, [/*mode,*/ appId, queryParams]);

    if (!Meteor.user()) {
        return {
            status: EnumMethodResult.STATUS_NOT_LOGGED_IN,
            statusText: `Sie sind nicht angemeldet und haben keinen Zugriff auf die Defaultwerte der App "${app?.title}".`
        };
    }

    useEffect( () => {
        let unmounted = false;

        if (!app) {
            return setDefaultData({
                status: EnumMethodResult.STATUS_LOADING,
            });
        }
        /*if (mode != EnumDocumentModes.NEW) {
            return setDefaultData({
                status: EnumMethodResult.STATUS_OKAY,
                defaults: {}
            });
        }*/

        Meteor.call('__app.' + app._id + '.getDefaults', { appId: app._id, queryParams }, (err: Error, result: IDefaultAppData<any>) => {
            if (err) {
                if (!unmounted) setDefaultData({
                    status: EnumMethodResult.STATUS_SERVER_EXCEPTION,
                    statusText: `Es ist ein unbekannter Systemfehler beim ermitteln der Standardwerte aufgetreten. Bitte wenden Sie sich an den Systemadministrator. [${err.name}] ${err.message}`
                });
            } else {
                if (result.status == EnumMethodResult.STATUS_OKAY && result.defaults) {
                    const { defaults } = result;
        
                    Object.keys(app.fields).forEach(f => {
                        const field = app.fields[f];
                        const { type } = field;
        
                        if (type === EnumFieldTypes.ftDate || type === EnumFieldTypes.ftDatespan) {
                            const v = defaults[f];
                            if (v) {
                                defaults[f] = (type == EnumFieldTypes.ftDate ) ? moment(v) : [moment(v[0]), moment(v[1])]
                            }
                        }
        
                        if (type === EnumFieldTypes.ftYear) {
                            const v = defaults[f];
                            if (v) {
                                defaults[f] = moment( new Date('01/01/' + v) );
                            }
                        }
                    });
        
                    if (!unmounted) setDefaultData({                      
                        status: EnumMethodResult.STATUS_OKAY,
                        defaults
                    });
                } else {
                    if (!unmounted) setDefaultData(result);
                }
            }

            return () => { unmounted = true };
        });
    }, [/*mode,*/ appId, queryParams])

    return defaultData;
}


export type IuseActivitiesResult = [Array<IGenericDocument>|null, EnumMethodResult];

/** 
 * Lesen der activities für die angegebene App und den Datensatz
 * 
 */
export const useActivities = (appId: string, docId: string) => useTracker( ():IuseActivitiesResult => {
    if (!appId || !docId) return [null, EnumMethodResult.STATUS_ABORT];

    if (!Meteor.user()) {
        return [null, EnumMethodResult.STATUS_NOT_LOGGED_IN];
    }    

    const subName:string = `__app.${appId}.activities`;
    
    const handler = Meteor.subscribe(subName, docId);

    if (!handler.ready()) { 
        return [ null, EnumMethodResult.STATUS_LOADING];
    }

    const activities = Activities.find<IGenericDocument>({ appId, docId }).fetch();

    return [ activities, EnumMethodResult.STATUS_OKAY ];
}, [appId, docId]);



export const useAvatar = (userId:string) => useTracker( (): IGenericDocumentTrackerResult => {
    if (!Meteor.user()) {
        return [null, EnumMethodResult.STATUS_NOT_LOGGED_IN];
    }
    const handler = Meteor.subscribe('__avatar', userId);

    if (!handler.ready()) { 
        return [ null, EnumMethodResult.STATUS_LOADING];
    }

    const avatar = Avatars.findOne({ userId });

    return [
        avatar ? avatar.link() : null,
        EnumMethodResult.STATUS_OKAY
    ];
}, [userId]);

