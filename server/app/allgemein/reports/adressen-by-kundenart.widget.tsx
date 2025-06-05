//import React from 'react';
import { MebedoWorld } from '/server/app/mebedo-world';

import { getAppStore } from '/imports/api/lib/core';

import { Adresse } from '../apps/adressen';

export const WidgetAdressenByKundenart = MebedoWorld.createReport<Adresse, Adresse>('adressen-by-kundenart.widget', {

    type: 'widget',
    
    title: 'Anzahl Adressen gemäß Kundenart',
    description: 'Zählt alle Adressen der angegebenen Kundenart.',

    /*sharedWith: [],
    sharedWithRoles: ['EVERYBODY'],*/

    isStatic: false,

    liveDatasource: ({ isServer, publication, currentUser, document }) => {
        if (isServer && !currentUser) return publication?.ready();

        const AdressenCounts = getAppStore('adressen.counts');
        
        return AdressenCounts.find({ _id: document?.adressart });
    },

    actions: [
        {
            title: 'Drilldown',
            inGeneral: false,
            type: 'primary',

            description: 'Aufruf des Reports, der alle betroffenen Adressen im Detail zeigt',
            icon: 'fas fa-list-ol',
            iconOnly: true,

            visibleAt: ['Dashboard'],

            visibleBy: [ 'ADMIN', 'EMPLOYEE' ],
            executeBy: [ 'ADMIN', 'EMPLOYEE' ],

            onExecute: { 
                redirect: '/reports/adressen-by-kundenart?adressart={{doc.adressart}}'
            }
        },
        /*{
            title: 'Löschen',
            inGeneral: false,
            type: 'more',
            description: 'Löschen eines Seminarteilnehmers',
            icon: 'fas fa-trash',
            iconOnly: true,

            visibleBy: [ 'ADMIN', 'EMPLOYEE' ],
            executeBy: [ 'ADMIN', 'EMPLOYEE' ],

            onExecute: { 
                // executes meteor method
            }
        },*/
    ]
});