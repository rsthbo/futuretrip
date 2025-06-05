import React, { useEffect, useState } from 'react';

import Button from 'antd/lib/button';
import Result from 'antd/lib/result';
import Spin from 'antd/lib/spin';

import { Accounts } from 'meteor/accounts-base';


export interface IVerifyAccountProps {
    token: string
}

export const VerifyAccount = (props: IVerifyAccountProps) => {
    const [ inProgress, setProgress] = useState(true);
    const [ error, setError] = useState<Error>();

    const { token } = props;

    useEffect( () => {
        Accounts.verifyEmail(token, err => {
            setProgress(false);

            if (err) {
                setError(err);
            }
        });
    }, [])
    
    const closeWindow = () => {
        window.close();
    }

    if (inProgress) return <Spin />;

    if (error) {
        return (
            <Result
                className="mbac-verification-error"
                status="error"
                title="Fehler beim Bestätigen Ihres Zugangs"
                subTitle={error.name + ' ' + error.message}
            />
        )
    } else {
        return (
            <Result
                className="mbac-verification-error"
                status="success"
                title="Zugang bestätigt!"
                subTitle="Ihr Zugang wurde erfolgreich bestätigt."
                extra={[
                    <Button type="default" onClick={closeWindow}>Fenster schließen</Button>
                ]}
            />
        )

    }
}