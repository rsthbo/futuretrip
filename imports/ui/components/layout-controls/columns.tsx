import React from 'react';

import Row from 'antd/lib/row';
import Col from 'antd/lib/col';

import { GenericControlWrapper, IGenericControlProps } from "./generic-control-wrapper";
import { IAppLayoutElementColumns } from '/imports/api/types/app-types';
import { LayoutElements } from '../app-layout';

export const Columns = (props: IGenericControlProps) => {
    const { columns } = props.elem as IAppLayoutElementColumns<any>;
    
    return (
        <GenericControlWrapper {...props} withoutInput className="mbac-columns" >
            <Row gutter={[16,16]} style={{marginBottom:16}}>
                { columns.map( (col, colIndex) => {
                    const { columnDetails } = col;
                    return (
                        <Col key={colIndex} { ...columnDetails } >
                            <LayoutElements { ...props } elements={col.elements} />
                        </Col>
                    );
                })}
            </Row>
        </GenericControlWrapper>
    );
}