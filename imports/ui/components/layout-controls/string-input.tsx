import React from 'react';

import Input from 'antd/lib/input';

import { GenericControlWrapper, IGenericControlProps } from "./generic-control-wrapper";


export const StringInput = (props: IGenericControlProps) => {
    return (
        <GenericControlWrapper { ...props } className="mbac-input mbac-string" >
            <Input  />
        </GenericControlWrapper>
    );
}

export const TextInput = (props: IGenericControlProps) => {
    return (
        <GenericControlWrapper { ...props } className="mbac-input mbac-text" >
            <Input.TextArea rows={4} />
        </GenericControlWrapper>
    );
}