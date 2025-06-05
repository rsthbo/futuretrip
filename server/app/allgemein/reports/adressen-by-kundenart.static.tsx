import React from 'react';
import { MebedoWorld } from '/server/app/mebedo-world';

import Tag from 'antd/lib/image';
import { getAppStore } from '/imports/api/lib/core';

import { TOptionValues } from '/imports/api/types/app-types';
import { IReportRendererExtras } from '/imports/api/types/world';

import { Adresse } from '../apps/adressen';
import { Adressarten, AdressartenEnum } from '../apps/adressarten';

export const StaticReportAdressenByKundenart = MebedoWorld.createReport<Adresse, Adresse>('adressen-by-kundenart-static', {

    type: 'table',
    
    title: 'Adressen gemäß Kundenart',
    description: 'Zeigt alle Adressen der angegebenen Kundenart.',

    /*sharedWith: [],
    sharedWithRoles: ['EVERYBODY'],*/

    isStatic: true,

    staticDatasource: ({ isServer, currentUser, document }) => {
        if (isServer && !currentUser) return;

        const Adressen = getAppStore('adressen');
        
        return Adressen.find({ adressart: document?.adressart }, { sort: { title: 1 } }).fetch();
    },

    injectables: {
        Adressarten
    },

    columns: [
        {
            title: 'Adresse',
            dataIndex: 'title',
            key: 'title',
            render: (title: any, adresse, extras: IReportRendererExtras) => {                
                const { _id } = adresse;
                const { isExport } = extras;

                return (
                    isExport 
                        ? title
                        : <a href={`/allgemein/adressen/${_id}`}>{title}</a>
                );
            }
        },
        {
            title: 'Kundenart',
            dataIndex: 'kundenart',
            key: 'kundenart',
            render: (kundenart: string, _adresse, { injectables, isExport }: IReportRendererExtras ) => {
                const { Adressarten }: { Adressarten?: TOptionValues<AdressartenEnum> } = injectables;
                const adrKundenart = Adressarten && Adressarten.find( ({_id}:{_id:any}) => _id == kundenart );
                
                if (!adrKundenart) {
                    return isExport ? '!!' + kundenart : <Tag>{'!!' + kundenart}</Tag>
                }
                return (
                    isExport
                        ? adrKundenart.title
                        : <Tag style={ { color: adrKundenart.color as string, backgroundColor: adrKundenart.backgroundColor as string, borderColor: adrKundenart.color as string}}>
                            {adrKundenart.title}
                        </Tag>
                );
            },
        },
    ],

    actions: [
        {
            title: 'Neu',
            inGeneral: true,
            type: 'primary',

            description: 'Neuzugang einer Adresse',
            icon: 'fas fa-plus',
            iconOnly: false,

            visibleAt: ['ReportPage'],
            
            visibleBy: [ 'ADMIN', 'EMPLOYEE' ],
            executeBy: [ 'ADMIN', 'EMPLOYEE' ],

            onExecute: { 
                redirect: '/allgemein/adressen/new'
            }
        },
        {
            title: 'Bearbeiten',
            inGeneral: false,
            type: 'primary',

            description: 'Bearbeiten eines Seminarteilnehmers',
            icon: 'far fa-edit',
            iconOnly: true,
            
            visibleAt: ['ReportPage', 'Dashboard'],

            visibleBy: [ 'ADMIN', 'EMPLOYEE' ],
            executeBy: [ 'ADMIN', 'EMPLOYEE' ],

            onExecute: { 
                redirect: '/akademie/seminarteilnehmer/{{rowdoc._id}}'
            }
        },
        {
            title: 'Löschen',
            type: 'secondary',
            description: 'Löschen eines Seminarteilnehmers',
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