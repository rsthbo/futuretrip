import React from 'react';

import DatePicker from 'antd/lib/date-picker';
import TimePicker from 'antd/lib/time-picker';

import { GenericControlWrapper, IGenericControlProps } from "./generic-control-wrapper";

export const DateInput = (props: IGenericControlProps) => {   
    return (
        <GenericControlWrapper {...props} className="mbac-input mbac-date" >
            <DatePicker format='DD.MM.YYYY' />
        </GenericControlWrapper>
    );
}

export const DatespanInput = (props: IGenericControlProps) => {
    return (
        <GenericControlWrapper {...props} className="mbac-input mbac-datespan" >
            <DatePicker.RangePicker format='DD.MM.YYYY'  />
        </GenericControlWrapper>
    );
}

export const TimespanInput = (props: IGenericControlProps) => {
    return (
        <GenericControlWrapper {...props} className="mbac-input mbac-timespan" >
            <TimePicker.RangePicker format='HH:mm:ss'  />
        </GenericControlWrapper>
    );
}

export const YearInput = (props: IGenericControlProps) => {   
    return (
        <GenericControlWrapper {...props} className="mbac-input mbac-year">
            <DatePicker picker="year" />
        </GenericControlWrapper>
    );
}