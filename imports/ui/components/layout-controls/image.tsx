import React from 'react';

import Image from 'antd/lib/image';

import { GenericControlWrapper, IGenericControlProps } from "./generic-control-wrapper";
import { IAppLayoutElementImage } from '/imports/api/types/app-types';
import { EnumDocumentModes } from '/imports/api/consts';


export const ImageViewer = (props: IGenericControlProps) => {
    const elem = props.elem as unknown as IAppLayoutElementImage<any>;

    const { mode, document, defaults } = props;

    const doc = mode == EnumDocumentModes.NEW ? defaults : document;
    const value = (doc || {})[elem.field as string];

    return (
        <GenericControlWrapper { ...props } withoutInput className="mbac-image" >
            <Image preview={false} src={value} style={elem.style} />
        </GenericControlWrapper>
    );
}
