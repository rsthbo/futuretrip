import React from 'react';
import { MebedoWorld } from '/server/app/mebedo-world';

import Tag from 'antd/lib/image';
import { getAppStore } from '/imports/api/lib/core';
import { check } from 'meteor/check';

import { Teilnehmerstati } from '../apps/teilnehmerstati';
import { Seminarteilnehmer } from '../apps/seminarteilnehmer';

import { AppData } from '/imports/api/types/app-types';
import { IReportRendererExtras } from '/imports/api/types/world';
import { Seminar, Seminare } from '../apps/seminare';
import { EnumDocumentModes } from '/imports/api/consts';
import { DefaultReportActions } from '../../defaults';

export const SeminarteilnehmerBySeminar = MebedoWorld.createReport<Seminarteilnehmer, Seminar>('seminarteilnehmer-by-seminar', {    
    title: 'Seminarteilnehmer',
    description: 'Zeigt alle Seminarteilnehmer des ausgewählten Seminars an.',

    /*sharedWith: [],
    sharedWithRoles: ['EVERYBODY'],*/

    isStatic: false,

    liveDatasource: ({ document: seminar, mode, isServer, publication, /*currentUser*/ }) => {
        //if (isServer && !publication.userId) return publication.ready();
        if (isServer && mode === EnumDocumentModes.NEW) return publication?.ready();

        const _id = seminar?._id || '';
        check(_id, String);

        const Seminarteilnehmer = getAppStore('seminarteilnehmer');
        
        return Seminarteilnehmer.find({ 'seminar._id': _id }, { sort: { title: 1 } });
    },

    injectables: {
        Teilnehmerstati
    },

    type: 'table',
    tableDetails: {
        columns: [
            {
                title: 'Teilnehmer',
                dataIndex: 'title',
                key: 'title',
                render: (title: any, teilnehmer, extras: IReportRendererExtras) => {                
                    const { _id } = teilnehmer;
                    const { isExport } = extras;

                    return (
                        isExport 
                            ? title
                            : <a href={`/akademie/seminarteilnehmer/${_id}`}>{title}</a>
                    );
                }
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (status: string, _seminarteilnehmer: AppData<Seminarteilnehmer>, { injectables, isExport }: IReportRendererExtras ) => {
                    const { Teilnehmerstati } = injectables;
                    const tnStatus = Teilnehmerstati.find( ({_id}:{_id:any}) => _id == status );
                    
                    if (!tnStatus) {
                        return isExport ? '!!' + status : <Tag>{'!!' + status}</Tag>
                    }
                    return (
                        isExport
                            ? tnStatus.title
                            : <Tag style={{color:tnStatus.color, backgroundColor:tnStatus.backgroundColor, borderColor:tnStatus.color}}>
                                {tnStatus.title}
                            </Tag>
                    );
                },
            },
        ],
    },

    actions: [
        DefaultReportActions.newDocument([ 'ADMIN', 'EMPLOYEE' ], Seminare, { 
            onExecute: { redirect: '/akademie/seminarteilnehmer/new?seminarId={{parentRecord._id}}' } 
        }),        
    ]
    
})