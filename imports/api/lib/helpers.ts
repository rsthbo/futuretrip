import { AppData, TAppLink, TAppLinkItem, UpdateableAppData } from "../types/app-types";

interface  IExtras {
    title?: string | null,
    onUpdate?: string | null
}

export const FieldNamesAndMessages = (artikel: string, nameSingular: string, artikelPlural: string, namePlural:string, extras:IExtras = { title: null, onUpdate: null }) => {
    const { onUpdate, title } = extras;

    let nam = {
        title: title || nameSingular,

        namesAndMessages: {
            singular: { ohneArtikel: nameSingular, mitArtikel: artikel + ' ' + nameSingular},
            plural: { ohneArtikel: namePlural, mitArtikel: artikelPlural || artikel + ' ' + namePlural},

            messages: {
                onUpdate: onUpdate || (artikel + ' ' + nameSingular)
            }
        }
    }

    return nam;
}

/**
 * Check if the value is an item of the array
 * 
 * @param {*} v Value to compare with Array-items
 * @param {*} a Array to compare
 * @returns true or false if value exists in item
 */
 export const isOneOf = (v:any, a:Array<any>):boolean => {
	let i:number, max:number = a.length;

	for (i=0; i < max; i++) {
		if (a[i] === v) return true;
	}

	return false;
}

/**
 * Generiert einen Single-AppLink inkl. Item für die TAppLink Felder
 * 
 * @param doc Document, welches zur Generierung des Applink verwandt werden soll
 * @param options.link Optional: Linkadresse für das Item ohne ID, die dann dynamisch aus dem übergebenen Dokument angehangen wird
 * @returns 
 */
export const getAppLink = (doc: AppData<any>, options:{ link: string }): TAppLink => {
    if (!doc) return [];

    /*const al: TAppLinkItem = {
        _id: doc._id,
        title: doc.title,
        description: doc.description,
        imageUrl: doc.imageUrl
    };

    if (link) {
        al.link = link + (link.endsWith('/') ? '' : '/') + doc._id;
    }*/

    return [
        getAppLinkItem(doc, options)
    ];
}

/**
 * Generiert ein AppLinkItem für die Verwendung innerhalb eines TAppLink Types
 * 
 * @param doc Document, welches zur Generierung des ApplinkItem verwandt werden soll
 * @param options.link Optional: Linkadresse für das Item ohne ID, die dann dynamisch aus dem übergebenen Dokument angehangen wird
 * @returns 
 */
 export const getAppLinkItem = (doc: AppData<any> | UpdateableAppData<any>, { link }:{ link: string }): TAppLinkItem => {
    const al: TAppLinkItem = {
        _id: doc._id,
        title: doc.title,
        description: doc.description,
        imageUrl: doc.imageUrl
    };

    if (link) {
        al.link = link + (link.endsWith('/') ? '' : '/') + doc._id;
    }

    return al;
}


/**
 * Returns the string with uppercase first letter
 * 
 * @param text 
 * @returns string
 */
export const firstLetterUppercase = (text:string) => {
    return text[0].toUpperCase() + text.substring(1);
}
