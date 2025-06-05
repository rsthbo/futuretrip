import React, { useState } from "react";
import { GenericControlWrapper, IGenericControlProps } from "./generic-control-wrapper";
import { IGenericDocument } from "/imports/api/lib/core";
import { useOnce } from "/imports/api/lib/react-hooks";
import { IAppLayoutElementGoogleMap, IGoogleMapsLocationProps } from "/imports/api/types/app-types";

export type IOnValuesChangeCallback = (
    changedValues: IGenericDocument,
    allValues: IGenericDocument
) => void;

export interface IGoogleMapProps extends IGenericControlProps {
    elem: IAppLayoutElementGoogleMap<any>,
}

export const GoogleMap = (props: IGoogleMapProps) : JSX.Element => {
    const { elem, mode, document, onValuesChange } = props;
    const
        height = elem.googleMapDetails.height || '500px',
        width = elem.googleMapDetails.width || '100%';
    
    const [location, setLocation] = useState<string>('');
    const [errEval, setErrEval] = useState<Error|null>(null);

    let computeLocation = function(_props: IGoogleMapsLocationProps):string {
        if (errEval) console.warn('Die Funktion location für googleMaps lässt sich nicht evaluieren.\n' + errEval.message);
        return '';
    }

    try {
        computeLocation = eval(elem.googleMapDetails.location as string);
    }
    catch(err) {
        setErrEval(err);
    }

    useOnce( () => {
        try {
            const newLocation = computeLocation({ currentLocation: location, document, mode });
            if (newLocation !== location) setLocation(newLocation);
        } catch (err) {
            console.warn('Die Funktion computeLocation für googleMaps ist fehlerhaft.\n' + err.message);
        }
    });

    onValuesChange( (changedValues, allValues) => {
        try {
            const newLocation = computeLocation({ currentLocation: location, document, mode, allValues, changedValues });
            if (newLocation !== location) setLocation(newLocation);
        } catch (err) {
            console.warn('Die Funktion computeLocation für googleMaps ist fehlerhaft.\n' + err.message);
        }
    });

    const encodedLocation = encodeURIComponent(location);
    
    return (
        <GenericControlWrapper {...props} withoutInput className="mbac-google-maps" >
            <div className="mapouter" style={{position:'relative',textAlign:'right', width, height, marginBottom:16 }}>
                <div className="gmap_canvas" style={{overflow:'hidden',background:'none!important', width, height}}>
                    <iframe 
                        width={width} height={height} 
                        id="gmap_canvas" 
                        src={"https://maps.google.com/maps?q=" + encodedLocation + "&t=&z=15&ie=UTF8&iwloc=&output=embed"} 
                        frameBorder="0" scrolling="no" 
                        marginHeight={0} 
                        marginWidth={0}
                    >
                    </iframe>
                    <br />
                    <a href="https://www.embedgooglemap.net">google html code</a>
                </div>
            </div>
        </GenericControlWrapper>
    );
}
