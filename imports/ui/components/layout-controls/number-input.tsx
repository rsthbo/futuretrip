import React from 'react';

import InputNumber from 'antd/lib/input-number';

import { GenericControlWrapper, IGenericControlProps } from "./generic-control-wrapper";

export const NumberInput = (props: IGenericControlProps) => {
    return (
        <GenericControlWrapper { ...props } className="mbac-input mbac-number" >
            <InputNumber />
        </GenericControlWrapper>
    );
}

export const CurrencyInput = (props: IGenericControlProps) => {
    return (
        <GenericControlWrapper { ...props } className="mbac-input mbac-currency" >
            <InputNumber
                addonAfter="€"
                precision={2}
                decimalSeparator=","
                controls={false}
            />
        </GenericControlWrapper>
    )
}