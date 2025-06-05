import React from 'react';
import { check } from 'meteor/check';

import { MebedoWorld } from '/server/app/mebedo-world';

import { getAppStore } from '/imports/api/lib/core';

import { IReportRendererExtras } from '/imports/api/types/world';

import { Adresse, Adressen } from '../apps/adressen';
import { Kontakt, Kontakte } from '../apps/kontakte';
import { DefaultReportActions } from '../../defaults';

export const ReportKontakteByAdresse = MebedoWorld.createReport<Kontakt, Adresse>('kontakte-by-adresse', {
    title: 'Kontakte gemäß Adresse',
    description: 'Zeigt alle Kontakte der angegebenen Adresse.',

    isStatic: false,

    liveDatasource: ({ isServer, publication, currentUser, document:adresse }) => {
        if (isServer && !currentUser) return publication?.ready();

        const adressenId = adresse?._id || '';
        check(adressenId, String);


        const KontakteApp = getAppStore('kontakte');
        
        return KontakteApp.find({ 'adresse._id': adressenId }, { sort: { title: 1 } });
    },

    type: 'table',
    tableDetails: {
        columns: [
            {
                title: 'Kontakt',
                dataIndex: 'title',
                key: 'title',
                render: (title: any, adresse, extras: IReportRendererExtras) => {                
                    const { _id } = adresse;
                    const { isExport } = extras;

                    return (
                        isExport 
                            ? title
                            : <a href={`/allgemein/kontakte/${_id}`}>{title}</a>
                    );
                }
            },
            {
                title: 'Beschreibung',
                dataIndex: 'description',
                key: 'description',
                render: (title) => title
            },
        ],
    },

    actions: [
        DefaultReportActions.newDocument(['ADMIN', 'EMPLOYEE'], Kontakte, { onExecute: { redirect: '/allgemein/kontakte/new?adressId={{doc._id}}' }}),
        DefaultReportActions.editDocument(['ADMIN', 'EMPLOYEE'], Kontakte),
        DefaultReportActions.removeDocument(['ADMIN', 'EMPLOYEE'], Kontakte),
    ]
});