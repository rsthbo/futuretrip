import React from 'react';
import { MebedoWorld } from '/server/app/mebedo-world';

import Tag from 'antd/lib/tag';

import { IReportRendererExtras } from '/imports/api/types/world';
import { EnumDocumentModes } from '/imports/api/consts';
import { Projekt, Projekte } from '../apps/projekte';
import { Projektstati } from '../apps/projektstati';
import { getAppStore } from '/imports/api/lib/core';
import { isArray } from '/imports/api/lib/basics';

export const ProjekteByUser = MebedoWorld.createReport<Projekt, Projekt>('projekte-by-user', {
    title: 'Projekte',
    description: 'Zeigt alle Projekte an.',

    isStatic: false,

    liveDatasource: ({ mode, document: params, isServer, publication, /*currentUser*/ }) => {
        if (isServer && mode === EnumDocumentModes.NEW) return publication?.ready();

        let $$Projekte: any;
        
        if (isServer) {
            $$Projekte = Projekte;
        } else {
            $$Projekte = getAppStore('projekte');
        }

        return $$Projekte.find({
            status: isArray(params?.status) ? { $in: params?.status } : params?.status 
        }, { sort: { title: 1 } });
    },

    injectables: {
        Projektstati
    },

    type: 'table',
    tableDetails: {
        columns: [
            {
                title: 'Projekt',
                dataIndex: 'title',
                key: 'title',
                render: (title: string, projekt, extras: IReportRendererExtras) => {                
                    const { _id } = projekt;
                    const { isExport } = extras;

                    return (
                        isExport 
                            ? title
                            : <a href={`/consulting/projekte/${_id}`}>{title}</a>
                    );
                }
            },
            {
                title: 'Beschreibung',
                dataIndex: 'description',
                key: 'description'
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (status: string, _projekt, { injectables, isExport }: IReportRendererExtras ) => {
                    const { Projektstati } = injectables;
                    const tpStatus = Projektstati.find( ({_id}:{_id:any}) => _id == status );
                    
                    if (!tpStatus) {
                        return isExport ? '!!' + status : <Tag>{'!!' + status}</Tag>
                    }
                    return (
                        isExport
                            ? tpStatus.title
                            : <Tag style={{color:tpStatus.color, backgroundColor:tpStatus.backgroundColor, borderColor:tpStatus.color}}>
                                {tpStatus.title}
                            </Tag>
                    );
                },
            },
        ],
    },

    actions: [
        
    ]
    
})