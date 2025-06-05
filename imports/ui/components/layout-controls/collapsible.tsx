import React from 'react';

import Collapse from 'antd/lib/collapse';

import { GenericControlWrapper, IGenericControlProps } from "./generic-control-wrapper";
import { IAppLayoutElementCollapsible } from '/imports/api/types/app-types';
import { getLabel, LayoutElements } from '../app-layout';


export const Collapsible = (props: IGenericControlProps) => {
    const {  app } = props;
    const elem: IAppLayoutElementCollapsible<any> = props.elem as IAppLayoutElementCollapsible<any>;
    
    return (
        <GenericControlWrapper {...props} withoutInput className="mbac-collapse" >
            <Collapse defaultActiveKey={elem.collapsedByDefault ? ['1'] : undefined}
                style={{marginBottom:16}}
            >
                <Collapse.Panel header={getLabel(elem, app.fields)} key="1">
                    <LayoutElements { ...props } elements={elem.elements} />
                </Collapse.Panel>
            </Collapse>
        </GenericControlWrapper>
    );
}
