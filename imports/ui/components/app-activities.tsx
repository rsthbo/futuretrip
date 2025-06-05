import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Meteor } from 'meteor/meteor';

import List from 'antd/lib/list';
import Form from 'antd/lib/form';
import Button from 'antd/lib/button';
import Comment from 'antd/lib/comment';
import Tooltip from 'antd/lib/tooltip';
import Modal from 'antd/lib/modal';
import Spin from 'antd/lib/spin';
import message from 'antd/lib/message';

import moment from 'moment';


import { FlowRouter } from 'meteor/kadira:flow-router';


import { useActivities } from '/client/clientdata';
import { EnumDocumentModes, EnumMethodResult } from '/imports/api/consts';
import { Expert } from './expert';
import { DiffDrawer } from './differ-drawer';
import { ReplyTo } from './reply-to';
import { MentionsWithEmojis } from './input-mentions-with-emojis';
import { IMethodStatus } from '/imports/api/types/world';


interface IAppActivitiesProps {
    currentUser: any;
    appId: string,
    docId: string,
    mode: EnumDocumentModes
}

export const AppActivities = (props: IAppActivitiesProps): JSX.Element | null => {
    const { currentUser, appId, docId, mode } = props;

    const [ activities, activitiesStatus ] = useActivities(appId, docId);
    
    const [form] = Form.useForm();
    const activitiesEndRef = useRef(null);

    const [ _currentTime, setTime ] = useState(new Date());
    const [ working, setWorking ] = useState(false);
    const [ canPostMessage, setCanPostMessage ] = useState(false);

    useEffect( () => {
        // check for hash in route
        const hash = FlowRouter.current().context.hash;
        if (!hash) {
            // scroll to end of list
            //activitiesEndRef.current.scrollIntoView(); //{ behavior: "smooth" })
        } else {
            // scroll to hashed item
            const el = $('#' + hash).get(0);
            if (el) el.scrollIntoView();
        }
        
        const timer = setInterval( () => {
            setTime(new Date());
        }, 1000 * 60 /* 1x pro Minute*/);

        return function cleanup(){
            clearInterval(timer);
        }
    }, [activitiesStatus]);


    if (activitiesStatus == EnumMethodResult.STATUS_LOADING) {
        return <div style={{textAlign:'center',marginTop:32}}>
            <Spin />
        </div>;
    }

    if (currentUser) {
        let post = false/* TODO:,
            perm = { currentUser };*/

        /*TODO: const sharedWithUser = opinion.sharedWith.find( shared => shared.user.userId === currentUser._id );
        
        if (sharedWithUser && sharedWithUser.role) {
            perm.sharedRole = sharedWithUser.role;
        }*/
        
        post = true; //hasPermission(perm, 'opinion.canPostMessage');
        
        if (post != canPostMessage) setCanPostMessage(post);
    }

    const postMessage = () => {
        form.validateFields().then( values => {
            setWorking(true);

            setTimeout( _ => {
                Meteor.call(`__app.${appId}.activities.post`, { docId, msg: values.message }, (err: Meteor.Error, res: IMethodStatus) => {
                    setWorking(false);
                    
                    if (err) {
                        return Modal.error({
                            title: 'Fehler',
                            content: 'Es ist ein interner Fehler aufgetreten. ' + err.message
                        });
                    }

                    if (res.status !== EnumMethodResult.STATUS_OKAY) {
                        return message.warning({content: 'Es ist ein Fehler aufgetreten: ' + res.statusText});
                    }
                    
                    form.resetFields();
                });
            }, 100);
        }).catch( _info => {
            
        });
    }

    const renderAnswers = (answers:any) => {
        if (!answers || answers.length == 0)
            return null;

        return (
            <List
                itemLayout="horizontal"
                dataSource={answers}
                renderItem={ (item:any) => (
                    <li>
                        <Comment                        
                            author={item.createdBy.firstName + ' ' + item.createdBy.lastName}
                            avatar={<Expert onlyAvatar user={item.createdBy}/> /*<Avatar>{item.createdBy.firstName.charAt(0) + item.createdBy.lastName.charAt(0)}</Avatar>*/}
                            content={
                                <span dangerouslySetInnerHTML={ { __html: item.message } }></span>
                            }
                            datetime={
                                <Tooltip title={moment(item.createdAt).format('DD.MM.YYYY HH:mm')}>
                                    <span>{moment(item.createdAt).locale('de').fromNow()}</span>
                                </Tooltip>
                            }
                        />
                    </li>
                )}
            />
        );
    }


    let renderedActivities = activities;
    if (!docId) {
        renderedActivities = [
            {   _id: "new", 
                createdAt: new Date(), 
                createdBy: { firstName: currentUser.userData.firstName, lastName: currentUser.userData.lastName },
                message: 'in Erstellung...'
            }
        ];
    }

    return (
        <Fragment>
            
            <List
                className="comment-list"
                itemLayout="horizontal"
                dataSource={renderedActivities || undefined}
                //loading={activitiesStatus == EnumMethodResult.STATUS_LOADING}
                renderItem={item => (
                    <li id={item._id}>
                        <Comment
                            actions={canPostMessage ? [
                                <ReplyTo appId={appId} docId={docId} activityId={item._id} />
                            ] : []}
                            author={ item.createdBy.firstName + ' ' + item.createdBy.lastName }
                            avatar={ <Expert onlyAvatar user={item.createdBy}/> /*<Avatar>{item.createdBy.firstName.charAt(0) + item.createdBy.lastName.charAt(0)}</Avatar> */}
                            content={
                                <div>
                                    <span dangerouslySetInnerHTML={ { __html: item.message } }></span>
                                    { item.type == 'SYSTEM-LOG' 
                                        ? <DiffDrawer appId={appId} docId={docId} changes={item.changes} action={item.action} />
                                        : null
                                    }
                                    { renderAnswers(item.answers) }
                                </div>
                            }
                            datetime={
                                <Tooltip title={moment(item.createdAt).format('DD.MM.YYYY HH:mm')}>
                                    <span>{moment(item.createdAt).locale('de').fromNow()}</span>
                                </Tooltip>
                            }
                        />
                    </li>
                )}
            />

            { !canPostMessage
                ? null
                : <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        label="Nachricht"
                        name="message"
                        rules={[
                            {
                                required: true,
                                message: 'Bitte geben Sie eine Nachricht ein.',
                            },
                        ]}
                    >
                        <MentionsWithEmojis
                            method={`__app.${appId}.getUsersSharedWith`}
                            methodParams={{appId, docId}}
                            disabled={mode == EnumDocumentModes.NEW }
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button htmlType="submit" loading={working} disabled={mode == EnumDocumentModes.NEW } onClick={postMessage} type="primary">
                            Absenden
                        </Button>
                    </Form.Item>
                </Form>
            }

            <div ref={activitiesEndRef} />
        </Fragment>
    );
}