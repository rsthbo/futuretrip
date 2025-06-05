import React from 'react';

import { EnumDocumentModes } from '/imports/api/consts';
import { AppData } from '/imports/api/types/app-types';
import { ReportControl } from '../components/layout-controls/report';
import { IWorldUser } from '/imports/api/types/world';


interface IReportPageProps {
    currentUser: IWorldUser,
    mode: EnumDocumentModes,
    params: {
        reportId: string
    },
    queryParams: AppData<any>
}

export const ReportPage = ( props: IReportPageProps) => {
    const { currentUser, mode, params, queryParams } = props;
    const { reportId } = params;

    return (
        <ReportControl 
            environment='ReportPage'
            pageStyle={true} 
            reportId={reportId}
            currentUser={currentUser}
            mode={mode}
            document={queryParams} 
        />
    );
}