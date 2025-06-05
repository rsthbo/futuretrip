import React from 'react';

import Card from 'antd/lib/card';
import Statistic from 'antd/lib/statistic';

import { GenericControlWrapper, IGenericControlProps } from "./generic-control-wrapper";
import { IAppLayoutElementWidgetSimple } from '/imports/api/types/app-types';
import { EnumDocumentModes } from '/imports/api/consts';
import { isNumeric } from '/imports/api/lib/basics';


export const WidgetSimple = (props: IGenericControlProps) => {
    const elem: IAppLayoutElementWidgetSimple<any> = props.elem as IAppLayoutElementWidgetSimple<any>;
    /*const color = elem.color || '#666',
          borderColor = elem.color || '#eee',
          backgroundColor = elem.backgroundColor || '#fff'*/

    const {mode, document, defaults} = props;

    const doc = mode == EnumDocumentModes.NEW ? defaults : document;
    const value = (doc || {})[elem.field as string];
    let displayValue: string = '';

    if (isNumeric(value)) {
        // "0" wird auch als false interpretiert
        displayValue = value + '';
    } else {
        displayValue = value || '?';
    }

    let renderer = (value: any, _doc: any) => value;
    if (elem.render) {

        try {
            renderer = eval(elem.render as unknown as string);
            //displayValue = renderer(value, doc);
        } catch (err) {
            console.log('Fehler beim Rendering für die SimpleWidget-Komponente', err);
        }
    }
    const formatter = (value:any) => {
        return renderer(value, doc);
    }

    const additionalStyle = elem.style || {};

    return (
        <GenericControlWrapper { ...props } withoutInput className="mbac-widget-simple" >
            <div onClick={undefined} style={{/*color: color,*/ cursor: null ? 'pointer':'default', ...additionalStyle }} >
                <Card /*style={{borderColor, color, backgroundColor}}*/
                    //hoverable
                    actions={undefined}
                >
                    <Card.Meta 
                        //style={{borderColor}}
                        //avatar={}
                        //title={<span style={{color}}>{elem.title}</span>}
                    />
                    <Statistic
                        title={<div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{elem.title}</div>}
                        value={displayValue}
                        formatter={formatter}
                        prefix={<i style={{marginRight:16}} className={elem.icon} />}
                        //valueStyle={{ color }}
                    />
                </Card>
            </div>
        </GenericControlWrapper>
    );
}

