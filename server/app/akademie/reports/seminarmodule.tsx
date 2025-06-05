import React from 'react';
import { MebedoWorld } from '/server/app/mebedo-world';
import { getAppStore } from '/imports/api/lib/core';
import { IReportRendererExtras } from '/imports/api/types/world';

import { Seminarmodul, Seminarmodule } from '../apps/seminarmodule';

export const ReportSeminarmodule = MebedoWorld.createReport<Seminarmodul, Seminarmodul>('seminarmodule', {    
    title: 'Seminarmodule',
    description: 'Zeigt alle Seminarmodule an.',

    /*sharedWith: [],
    sharedWithRoles: ['EVERYBODY'],*/

    isStatic: false,

    liveDatasource: ({ isServer, publication, currentUser }) => {
        if (isServer && !currentUser) return publication?.ready();
        
        const appStore = isServer ? Seminarmodule : getAppStore('seminarmodule');
        
        return appStore.find({}, { sort: { title: 1 } });
    },

    /*injectables: {
        Adressarten
    },*/
    type: 'table',
    tableDetails: {
        columns: [
            {
                title: 'Seminarmodul',
                dataIndex: 'title',
                key: 'title',
                render: (title: any, seminarmodul, extras: IReportRendererExtras) => {                
                    const { _id } = seminarmodul;
                    const { isExport } = extras;

                    return (
                        isExport 
                            ? title
                            : <a href={`/akademie/seminarmodule/${_id}`}>{title}</a>
                    );
                }
            },
            {
                title: 'Beschreibung',
                dataIndex: 'description',
                key: 'description'
            },
            {
                title: 'Modul',
                dataIndex: 'modul',
                key: 'modul'
            },
        ],
    },

    actions: [
        {
            title: 'Neu',
            inGeneral: true,
            type: 'primary',

            description: 'Neuzugang eines Seminamoduls',
            icon: 'fas fa-plus',
            iconOnly: false,

            visibleAt: ['ReportPage'],
            
            visibleBy: [ 'ADMIN', 'EMPLOYEE' ],
            executeBy: [ 'ADMIN', 'EMPLOYEE' ],

            onExecute: { 
                redirect: '/akademie/seminarmodule/new'
            }
        },
        {
            title: 'Bearbeiten',
            inGeneral: false,
            type: 'primary',

            description: 'Bearbeiten eines Seminamoduls',
            icon: 'far fa-edit',
            iconOnly: true,
            
            visibleAt: ['ReportPage', 'Dashboard'],

            visibleBy: [ 'ADMIN', 'EMPLOYEE' ],
            executeBy: [ 'ADMIN', 'EMPLOYEE' ],

            onExecute: { 
                redirect: '/akademie/seminarmodule/{{rowdoc._id}}'
            }
        },
        {
            title: 'Löschen',
            type: 'secondary',
            description: 'Löschen eines Seminamoduls',
            icon: 'fas fa-trash',
            iconOnly: true,

            visibleAt: ['ReportPage', 'Dashboard'],

            visibleBy: [ 'ADMIN', 'EMPLOYEE' ],
            executeBy: [ 'ADMIN', 'EMPLOYEE' ],

            onExecute: { 
                // executes meteor method
            }
        },
    ]
});