import React from 'react';

import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Form from 'antd/lib/form';

import { GenericControlWrapper, IGenericControlProps } from "./generic-control-wrapper";
import { IAppLayoutElementInlineCombination } from '/imports/api/types/app-types';
import { getLabel, LayoutElements } from '../app-layout';

export const InlineCombination = (props: IGenericControlProps) => {
    const { elements } = (props.elem as IAppLayoutElementInlineCombination<any>);

    return (
        <GenericControlWrapper {...props} withoutInput className="mbac-inline-combination" >
            <Row className="ant-form-item" style={{ display: 'flex', flexFlow:'row wrap' }}>
                <Col span={6} className="ant-form-item-label">
                    <label>{getLabel(props.elem!, props.app!.fields)}</label>
                </Col>
                <Col className="ant-form-item-control" style={{ display: 'flex', flexFlow:'row wrap' }}>
                    <LayoutElements { ...props } elements={elements} />
                </Col>
            </Row>
        </GenericControlWrapper>
    );
}

export const Spacer = (props: IGenericControlProps) => {
    const { elements, style } = (props.elem as IAppLayoutElementInlineCombination<any>);

    const additionalStyle = style || {};
    return (
        <GenericControlWrapper {...props} withoutInput className="mbac-spacer" >
            <Form.Item label={getLabel(props.elem!, props.app!.fields)} style={{ marginBottom: 0, ...additionalStyle }}>
                <LayoutElements { ...props } elements={elements} />
            </Form.Item>
        </GenericControlWrapper>
    );
}