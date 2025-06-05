import { Meteor } from 'meteor/meteor';
import React, { useEffect } from 'react';

import Spin from 'antd/lib/spin';
import notification from 'antd/lib/notification';

import { LoginPage } from './pages/login';
import { DefaultLayout } from './layouts/DefaultLayout';
import { useAccount } from '../../client/clientdata';
import { getAppStore } from '../api/lib/core';
import { IClientCollectionResult, IWorldUser } from '../api/types/world';
import { EnumMethodResult } from '../api/consts';
import { NotFoundPage } from './pages/not-found';
import { NotVerifiedPage } from './pages/not-verified';


export interface IAppProps {
    content: React.FC
    authenticatedRoute: boolean,
    routeStatus: string,
    props: any[]
}

export const App:React.FC<IAppProps> = ({ content, routeStatus, authenticatedRoute = true, ...props }) => {
    const { currentUser, isLoggedIn, accountVerified, accountsReady } = useAccount();
    //const { roles, rolesLoading } = useRoles();

    useEffect(() => {
        const reactRoot = document.getElementById('react-root');
        // add done for the initial loading
        reactRoot && reactRoot.classList.add('done');

        Meteor.call('__appData.clientCollectionInit', (err: Meteor.Error, result: IClientCollectionResult) => {
            if (err) {
                notification.error({
                    message: `Unbekannter Fehler`,
                    description: 'Es ist ein unbekannter Fehler beim initialisieren der Client-Appstores aufgetreten.' + err.message,
                    duration: 900
                });
            } else {
                const { appIds, status } = result;
            
                if (status == EnumMethodResult.STATUS_OKAY ) {
                    appIds && appIds.forEach( getAppStore ); //(appId: string) => getAppStore(appId))
                } else {
                    notification.error({
                        message: `Fehler`,
                        description: 'Es ist ein Fehler beim initialisieren der Client-Appstores aufgetreten.',
                        duration: 900
                    });
                }
            }
        })
    }, []);

    if (!accountsReady) {
        return <div className="mbac-loading-spinner">
            <Spin size="large"/>
        </div>
    }

    if (!authenticatedRoute) {
        return React.createElement(content, { ...props as any });
    }

    if (routeStatus == '404') {
        return <NotFoundPage />;
    }

    if (!isLoggedIn) {
        return <LoginPage />;
    }
    
    if (!accountVerified) {
        return <NotVerifiedPage />;
    }

    const contentProps: unknown = { currentUser, ...props };

    return (
        <div className="mbac-body mbac-theme-light" >
            <DefaultLayout currentUser={currentUser as IWorldUser} { ...props } >
                { React.createElement(content || null, contentProps as unknown as React.Attributes) }
            </DefaultLayout>
        </div>
    );
}