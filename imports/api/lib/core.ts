import { Mongo } from "meteor/mongo";

export interface IGenericDocument {
    [key: string]: any;
}

export interface IAppStore {
    [ key: string ]: Mongo.Collection<IGenericDocument>
}


export var appStore: IAppStore = {};

/**
 * Gibt den Store/Collection für das angegebene Modul zurück
 * 
 * @param {String} appId Name des Modul, für den der Store (Collection) ermittelt werden soll
 * @returns {Object} Mongo.Collection
 */
export const getAppStore = (appId: string): Mongo.Collection<any> => {
    let store = appStore[appId];
        
    if (!store) {
        appStore[appId] = new Mongo.Collection(appId);
        store = appStore[appId];
    }

    return store; 
}

export const createAppStore = (appId: string): Mongo.Collection<IGenericDocument> => {
    return getAppStore(appId);
}