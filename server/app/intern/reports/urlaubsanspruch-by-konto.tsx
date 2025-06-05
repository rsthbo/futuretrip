import React from 'react';
import { MebedoWorld } from '/server/app/mebedo-world';

import Tag from 'antd/lib/image';
import { getAppStore } from '/imports/api/lib/core';
import { check } from 'meteor/check';

import { AppData } from '/imports/api/types/app-types';
import { IReportRendererExtras } from '/imports/api/types/world';
import { EnumDocumentModes } from '/imports/api/consts';
import { Urlaubskonto } from '../apps/urlaubskonto';
import { Urlaubsanspruch, Urlaubsansprueche } from '../apps/urlaubsanspruch';
import { StatusUrlaubsanspruch } from '../apps/status-urlaubsanspruch';
import { DefaultReportActions } from '../../defaults';

export const UrlaubsanspruchByKonto = MebedoWorld.createReport<Urlaubsanspruch, Urlaubskonto>('urlaubsanspruch-by-konto', {    
    title: 'Urlaubsansprüche',
    description: 'Zeigt alle Urlaubsansprüche für dieses Urlaubskonto an.',

    isStatic: false,

    liveDatasource: ({ document: urlaubskonto, mode, isServer, publication, /*currentUser*/ }) => {
        if (isServer && mode === EnumDocumentModes.NEW) return publication?.ready();

        const _id = urlaubskonto?._id || '';
        check(_id, String);

        const appStore = isServer ? Urlaubsansprueche : getAppStore('urlaubsansprueche');
        
        return appStore.find({ 'urlaubskonto._id': _id }, { sort: { createdAt: 1 } });
    },

    injectables: {
        StatusUrlaubsanspruch
    },

    type: 'table',
    tableDetails: {
        columns: [
            {
                title: 'Betreff',
                dataIndex: 'title',
                key: 'title',
                render: (title: any, teilnehmer, extras: IReportRendererExtras) => {                
                    const { _id } = teilnehmer;
                    const { isExport } = extras;

                    return (
                        isExport 
                            ? title
                            : <a href={`/intern/urlaubsansprueche/${_id}`}>{title}</a>
                    );
                }
            },
            {
                title: 'Tage',
                dataIndex: 'anzahlTage',
                key: 'anzahlTage',
                align:'right',
                render: (tage) => tage === 1 ? '1 Tag': tage + ' Tage'
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                align: 'center',
                render: (status: string, _urlaubsanspruch: AppData<Urlaubsanspruch>, { injectables, isExport }: IReportRendererExtras ) => {
                    const { StatusUrlaubsanspruch } = injectables;
                    const anspruchStatus = StatusUrlaubsanspruch.find( ({_id}:{_id:any}) => _id == status );
                    
                    if (!anspruchStatus) {
                        return isExport ? '!!' + status : <Tag>{'!!' + status}</Tag>
                    }
                    return (
                        isExport
                            ? anspruchStatus.title
                            : <Tag style={{color:anspruchStatus.color, backgroundColor:anspruchStatus.backgroundColor, borderColor:anspruchStatus.color}}>
                                {anspruchStatus.title}
                            </Tag>
                    );
                },
            },
        ],
    },

    actions: [
        DefaultReportActions.newDocument(['ADMIN', 'BACKOFFICE'], Urlaubsansprueche, { 
            onExecute: { redirect: '/intern/urlaubsansprueche/new?urlaubskonto={{parentRecord._id}}' }
        }),
    ]
})