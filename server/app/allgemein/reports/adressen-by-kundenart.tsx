import React from 'react';
import { MebedoWorld } from '/server/app/mebedo-world';

import Tag from 'antd/lib/image';
import { getAppStore } from '/imports/api/lib/core';

import { TOptionValues } from '/imports/api/types/app-types';
import { IReportRendererExtras } from '/imports/api/types/world';

import { Adresse, Adressen } from '../apps/adressen';
import { Adressarten, AdressartenEnum } from '../apps/adressarten';
import { DefaultReportActions } from '../../defaults';

export const ReportAdressenByKundenart = MebedoWorld.createReport<Adresse, Adresse>('adressen-by-kundenart', {
    title: 'Adressen gemäß Adressart',
    description: 'Zeigt alle Adressen der angegebenen Adressart.',

    isStatic: false,

    liveDatasource: ({ isServer, publication, currentUser, document }) => {
        if (isServer && !currentUser) return publication?.ready();
        
        const Adressen = getAppStore('adressen');
        
        return Adressen.find({ adressart: document?.adressart }, { sort: { title: 1 } });
    },

    injectables: {
        Adressarten
    },

    type: 'table',
    tableDetails: {
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
                title: 'Beschreibung',
                dataIndex: 'description',
                key: 'description',
                render: (title) => title
            },
            {
                title: 'Adressart',
                dataIndex: 'adressart',
                key: 'adressart',
                render: (adressart: string, _adresse, { injectables, isExport }: IReportRendererExtras ) => {
                    const { Adressarten }: { Adressarten?: TOptionValues<AdressartenEnum> } = injectables;
                    const art = Adressarten && Adressarten.find( ({_id}:{_id:any}) => _id == adressart );
                    
                    if (!art) {
                        return isExport ? '!!' + adressart : <Tag>{'!!' + adressart}</Tag>
                    }
                    return (
                        isExport
                            ? art.title
                            : <Tag style={ { color: art.color as string, backgroundColor: art.backgroundColor as string, borderColor: art.color as string}}>
                                {art.title}
                            </Tag>
                    );
                },
            },
        ],
    },

    actions: [
        DefaultReportActions.newDocument(['ADMIN', 'EMPLOYEE'], Adressen),
        DefaultReportActions.editDocument(['ADMIN', 'EMPLOYEE'], Adressen),
        DefaultReportActions.removeDocument(['ADMIN', 'EMPLOYEE'], Adressen),
    ]
});