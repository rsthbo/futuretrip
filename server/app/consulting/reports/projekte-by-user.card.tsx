import { MebedoWorld } from '/server/app/mebedo-world';

import { EnumDocumentModes } from '/imports/api/consts';
import { Projekt, Projekte } from '../apps/projekte';
import { Projektstati } from '../apps/projektstati';
import { getAppStore } from '/imports/api/lib/core';
import { DefaultReportActions } from '../../defaults';

export const ProjekteByUserAsCard = MebedoWorld.createReport<Projekt, unknown>('projekte-by-user-card', {
    title: 'Projekte',
    description: 'Zeigt alle Projekte an, die mit Ihnen geteilt sind.',

    //sharedWith: [],
    //sharedWithRoles: ['EVERYBODY'],

    type: 'card',
    cardDetails: {
        width: { xs:24, sm:24, md:12, lg:8, xl:6, xxl:4},

        title: doc => doc.title,
        
        description: (doc, htmlElements) => {
            const { Space, Tag, Statistic, Progress, Divider } = htmlElements;

            return (
                <div className="mbac-description-content">
                    <div className="mbac-description-text">
                        <Space style={{flexWrap:'nowrap'}} split={<Divider type="vertical" />}>
                            {doc.description}
                            <Tag color="blue">geplant</Tag>
                        </Space>
                    </div>
                    <div style={{marginTop:16, paddingTop:16, borderTop: '1px solid #f1f1f1'}} className="mbac-statistics">
                        <Statistic title="Aufwand" value={(doc.aufwandPlanMinuten / 60 / 8) + ' Tage'} prefix={<i className="fas fa-list" />} />
                        <Progress percent={30} />

                        <Statistic title="Erlöse" value={doc.erloesePlan + ' €'} prefix={<i className="fas fa-dollar-sign" />} />
                        <Progress percent={70} />
                    </div>
                </div>
            )
        },

        cover: ({kunde}) => <img src={kunde[0].imageUrl} />,

        //avatar?: (document: AppData<T>) => JSX.Element
    },

    isStatic: false,
    liveDatasource: ({ mode, document: _params, isServer, publication, /*currentUser*/ }) => {
        if (isServer && mode === EnumDocumentModes.NEW) return publication?.ready();

        let $$Projekte: any;
        
        if (isServer) {
            $$Projekte = Projekte;
        } else {
            $$Projekte = getAppStore('projekte');
        }

        return $$Projekte.find({}, { sort: { title: 1 } });
    },

    injectables: {
        Projektstati
    },

    actions: [        
        DefaultReportActions.openDocument(['EVERYBODY'], Projekte),
        DefaultReportActions.shareDocument(['EVERYBODY'], Projekte, { type: 'secondary'}),
        DefaultReportActions.removeDocument(['ADMIN', 'EMPLOYEE'], Projekte, {type: 'more'})
    ] 
});