import React from 'react';

import Divider from 'antd/lib/divider';

import { GenericControlWrapper, IGenericControlProps } from "./generic-control-wrapper";
import { IAppLayoutElementDivider } from '/imports/api/types/app-types';


export const DividerControl = (props: IGenericControlProps) => {
    const elem: IAppLayoutElementDivider<any> = props.elem as IAppLayoutElementDivider<any>;

    return (
        <GenericControlWrapper {...props} withoutInput className="mbac-divider" >
            <Divider orientation={elem.orientation || 'left'} >{elem.title}</Divider>
        </GenericControlWrapper>
    );
}

