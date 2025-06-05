import React from 'react';
import { MebedoWorld } from '/server/app/mebedo-world';

import Tag from 'antd/lib/image';
import { getAppStore } from '/imports/api/lib/core';
import { check } from 'meteor/check';

import { IReportRendererExtras } from '/imports/api/types/world';
import { EnumDocumentModes } from '/imports/api/consts';
import { Teilprojekt } from '../apps/teilprojekte';
import { Projektstati } from '../apps/projektstati';
import { Aktivitaet } from '../apps/aktivitaeten';
import { Einheiten, EinheitenEnum } from '../apps/einheiten';
import { AppData, TInjectables, TOptionValues } from '/imports/api/types/app-types';

/**
 * Darstellung des Aufwands für die entspr. Spalte
 * @param aufwand 
 * @param akt 
 * @param param2 
 * @returns 
 */
const renderAufwand = (aufwand: any, akt: AppData<Aktivitaet>, {injectables, isExport}: {injectables: TInjectables, isExport: boolean}) => {
    const Einheiten: TOptionValues<EinheitenEnum> = injectables.Einheiten;
    const einheit = Einheiten.find( ({_id}:{_id:any}) => _id == akt.einheit );
    
    if (!einheit) {
        return isExport ? (aufwand || '0') + '!!' + akt.einheit : <Tag>{'!!' + (aufwand || '0 ') + akt.einheit}</Tag>
    }

    return (aufwand || '0') + ' ' + (aufwand === 1 ? einheit.title : einheit.pluralTitle)
}

export const AktivitaetenByTeilprojekte = MebedoWorld.createReport<Aktivitaet, Teilprojekt>('aktivitaeten-by-teilprojekte', {
    
    title: 'Aktivitäten',
    description: 'Zeigt alle Aktivitäten für das aktuelle Teilprojekt an.',

    isStatic: false,

    liveDatasource: ({ document: teilprojekt, mode, isServer, publication, /*currentUser*/ }) => {
        //if (isServer && !publication.userId) return publication.ready();
        if (isServer && mode === EnumDocumentModes.NEW) return publication?.ready();

        const _id = teilprojekt?._id || '';
        check(_id, String);

        const Aktivitaeten = getAppStore('aktivitaeten');
        
        return Aktivitaeten.find({ 'teilprojekt._id': _id }, { sort: { title: 1 } });
    },

    injectables: {
        Projektstati,
        Einheiten
    },

    type: 'table',
    tableDetails: {
        noHeader: true,
        columns: [
            {
                title: 'Aktivität',
                dataIndex: 'title',
                key: 'title',
                render: (title: string, aktivitaet, extras: IReportRendererExtras) => {                
                    const { _id } = aktivitaet;
                    const { isExport } = extras;

                    return (
                        isExport 
                            ? title
                            : <a href={`/consulting/aktivitaeten/${_id}`}>{title}</a>
                    );
                }
            },        
            {
                title: 'Aufwand',
                dataIndex: 'aufwandPlan',
                key: 'aufwandPlan',
                align: 'right',
                render: renderAufwand
            },
            {
                title: 'Ist',
                dataIndex: 'aufwandIst',
                key: 'aufwandIst',
                align: 'right',
                render: renderAufwand
            },
            {
                title: 'Rest',
                dataIndex: 'aufwandRest',
                key: 'aufwandRest',
                align: 'right',
                render: renderAufwand
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                align: 'center',
                render: (status: string, _aktivitaet, { injectables, isExport }: IReportRendererExtras ) => {
                    const { Projektstati } = injectables;
                    const aktStatus = Projektstati.find( ({_id}:{_id:any}) => _id == status );
                    
                    if (!aktStatus) {
                        return isExport ? '!!' + status : <Tag>{'!!' + status}</Tag>
                    }
                    return (
                        isExport
                            ? aktStatus.title
                            : <Tag style={{color:aktStatus.color, backgroundColor:aktStatus.backgroundColor, borderColor:aktStatus.color}}>
                                {aktStatus.title}
                            </Tag>
                    );
                },
            },
        ],
    },

    actions: [

    ]
    
})