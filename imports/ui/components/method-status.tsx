import React, { FunctionComponent, useRef } from "react"
import Progress from "antd/lib/progress";
import Button from "antd/lib/button";
import Result from "antd/lib/result";

import { EnumMethodResult } from "/imports/api/consts"
import { useState } from "react";
import { useEffect } from "react";


interface ISubscriptionStatus {
    status: EnumMethodResult,
    statusText?: string,
    text403?: string,
    text404?: string,
    text500?: string,    
}

type TMethodStatusProps = {
    key:string
    subscriptions: Array<ISubscriptionStatus>,
    className?: string
}

export const MethodStatusWrapper: FunctionComponent<TMethodStatusProps> = props => {
    const STARTVALUE = 1;

    const { subscriptions, className } = props;
    const [ percent, setPercent ] = useState(STARTVALUE);
    const [ intervalId, setInveralId ] = useState<NodeJS.Timer | null>(null);
    const [ endOfProgress, setEndOfProgress ] = useState(0);
    const percentRef = useRef(STARTVALUE);

    let subInfo: ISubscriptionStatus;

    const loading = subscriptions.filter( sub => sub.status == EnumMethodResult.STATUS_LOADING );
    const error = subscriptions.filter( sub => sub.status != EnumMethodResult.STATUS_LOADING && sub.status != EnumMethodResult.STATUS_OKAY);

    if (error.length > 0) {
        subInfo = error[0]
    } else {
        if (loading.length > 0) {
            subInfo = loading[0];
        } else {            
            subInfo = subscriptions[0];
        }
    }

    const { status, statusText, text403, text404, text500 } = subInfo;

    useEffect(() => {
        let unmounted = false;
        
        if (!unmounted) percentRef.current = percent;

        return () => { unmounted = true };
    });

    useEffect( () => {
        let unmounted = false;

        if (!unmounted) setInveralId(
            setInterval( () => { 
                if (!unmounted) setPercent(percentRef.current + 1);
            }, 50)
        );

        return () => {
            unmounted = true;
            if (intervalId) {
                clearInterval(intervalId);
            }
        }
    }, []);

    useEffect( () => {
        let unmounted = false;

        if (status == EnumMethodResult.STATUS_OKAY && !endOfProgress) {
            if (!unmounted) setEndOfProgress(1);
       
            if (intervalId) {
                clearInterval(intervalId);
                if (!unmounted) setInveralId(null);
            }                
        }

        if (endOfProgress == 1) {
            setTimeout( () => {
                if (!unmounted) {
                    setPercent(percentRef.current + 2);
                    setEndOfProgress(2);
                }
            }, 50);
        }

        if (endOfProgress == 2) {
            setTimeout( () => {
                if (!unmounted) {
                    setPercent(percentRef.current + 2);
                    setEndOfProgress(3);
                }
            }, 50);
        }

        if (endOfProgress == 3) {
            setTimeout( () => {
                if (!unmounted) {
                    setPercent(100);
                    setEndOfProgress(4);
                }
            }, 100);
        }

        if (endOfProgress == 4) {
            setTimeout( () => {
                if (!unmounted) {
                    setPercent(101);
                    setEndOfProgress(5);
                }
            }, 200);
        }

        return () => { 
            unmounted = true
        };
    }, [percent, status, endOfProgress]);


    if (status == EnumMethodResult.STATUS_LOADING || (status == EnumMethodResult.STATUS_OKAY && percent <= 100)) {
        const percentValue = percent >= 100 ? 100 : Math.trunc((percent/(1.5+percent))*100);

        return <Progress
            className="mbac-loading-progress"
            //type="circle"
            steps={20}
            strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
            }}
            percent={percentValue}
        />
    }

    if (status == EnumMethodResult.STATUS_NOT_FOUND || status == EnumMethodResult.STATUS_NOT_LOGGED_IN) {
        return <Result
            className={"mbac-loading-result mbac-result-" + status}
            status={status}
            title={status}
            subTitle={ status == "403" ? (text403 || "Sie besitzen keine Berechtigung") : (text404 || "Das Document existiert nicht") }
            extra={[
                <Button key="back" onClick={()=>history.back()}>Zurück</Button>
            ]}
        />
    }

    if (status == EnumMethodResult.STATUS_ABORT) {
        return <Result
            className="mbac-loading-result mbac-result-warning"
            status="warning"
            title="Verarbeitung abgebrochen"
            subTitle={statusText}
            extra={[
                <Button key="back" onClick={()=>history.back()}>Zurück</Button>
            ]}
        />
    }

    if (status == EnumMethodResult.STATUS_SERVER_EXCEPTION) {
        return <Result
            className="mbac-loading-result mbac-result-500"
            status={status}
            title="Unerwarteter Fehler aufgetreten"
            subTitle={text500 + ' ' + statusText}
            extra={[
                <Button key="back" onClick={()=>history.back()}>Zurück</Button>
            ]}
        />
    }

    return <div className={"mbac-method-status-wrapper " + (className || '')}>
        { props.children }
    </div>
}

export const MethodStatus = MethodStatusWrapper;