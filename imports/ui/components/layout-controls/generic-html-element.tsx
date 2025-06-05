import React from 'react';

import { GenericControlWrapper, IGenericControlProps } from "./generic-control-wrapper";
import { IAppLayoutElementHTMLElement } from '/imports/api/types/app-types';
import { EnumDocumentModes } from '/imports/api/consts';
import { LayoutElements } from '../app-layout';


export const GenericHTMLElement = (props: IGenericControlProps) => {
    const elem = props.elem as unknown as IAppLayoutElementHTMLElement<any>;

    const { mode, document, defaults } = props;

    const doc = mode == EnumDocumentModes.NEW ? defaults : document;
    const value = (doc || {})[elem.field as string];

    return (
        <GenericControlWrapper { ...props } withoutInput className="mbac-generic-html-element" >
            { React.createElement(
                elem.htmlElementDetails.element, 
                { className: elem.htmlElementDetails.className, style:elem.htmlElementDetails.style },
                value, 
                elem.elements && elem.elements.length ? <LayoutElements { ...props } elements={elem.elements} />: undefined
            )}
        </GenericControlWrapper>
    );
}
