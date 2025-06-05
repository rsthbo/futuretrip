import React from 'react';

import Button from 'antd/lib/button';
import Result from 'antd/lib/result';

export const NotFoundPage = () => {
    return (
        <Result
            status="404"
            title="404"
            subTitle="Die aufgerufene Seite existiert leider nicht."
            extra={<Button type="primary" onClick={ () => history.back() }>Zurück</Button>}
        />
    )
}