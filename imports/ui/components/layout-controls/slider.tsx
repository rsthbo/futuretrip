import React from 'react';

import Slider from 'antd/lib/slider';

import { GenericControlWrapper, IGenericControlProps } from "./generic-control-wrapper";
import { IAppLayoutElementSlider } from '/imports/api/types/app-types';


export const SliderInput = (props: IGenericControlProps) => {
    const elem = props.elem as unknown as IAppLayoutElementSlider<any>;

    return (
        <GenericControlWrapper { ...props } className="mbac-input mbac-slider" >
            <Slider {...elem.sliderDetails} />
        </GenericControlWrapper>
    );
}
