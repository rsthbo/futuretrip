//import React from 'react';
import { MebedoWorld } from '/server/app/mebedo-world';

import { getAppStore } from '/imports/api/lib/core';

import { Adresse } from '../apps/adressen';
import { IChartData } from '/imports/api/types/world';
import { ChartData, ChartOptions } from 'chart.js';

export const ChartAdressenByKundenart = MebedoWorld.createReport<Adresse, Adresse>('adressen-by-kundenart.chart', {
    title: 'Anzahl Adressen gemäß Kundenart',
    description: 'Zählt alle Adressen der angegebenen Kundenart.',

    type: 'chart',
    chartDetails: {
        chartType: 'bar'
    },
    
    isStatic: false,

    liveDatasource: ({ isServer, publication, currentUser }) => {
        if (isServer && !currentUser) return publication?.ready();

        const AdressenCounts = getAppStore('adressen.counts');
        
        if (isServer) {
            return AdressenCounts.find({});
        }

        return {
            fetch: (): IChartData => {
                let options: ChartOptions = {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'right' as const,
                        },
                        title: {
                            display: true,
                            text: 'Anzahl Adressen gemäß Adressart',
                        },
                    },
                };

                let data: ChartData = {
                    labels: ['Adressart'], //as Array<string>,
                    datasets: []
                };

                AdressenCounts.find({}).forEach( (adrCount: any) => {                    
                    data.datasets.push({
                        label: adrCount.title,
                        data: [adrCount.value],
                        backgroundColor: adrCount.backgroundColor 
                    });
                });

                return { options, data };
            }
        }
    },

});