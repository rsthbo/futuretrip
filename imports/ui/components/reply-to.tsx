import React, { Fragment, useState } from 'react';
import { Meteor } from 'meteor/meteor';

import Form from 'antd/lib/form';
import Button from 'antd/lib/button';
import message from 'antd/lib/message';

import { MentionsWithEmojis } from '/imports/ui/components/input-mentions-with-emojis';
import { IActivitiesReplyToProps } from '/imports/api/types/app-types';
import { IMethodStatus } from '/imports/api/types/world';
import { EnumMethodResult } from '/imports/api/consts';

const { useForm } = Form;

interface IReplyToProps {
    appId: string
    docId: string
    activityId: string
}

export const ReplyTo = ( props: IReplyToProps ): JSX.Element => {
    const { appId, docId, activityId } = props;

    const [ showInput, setShowInput ] = useState(false);
    const [ working, setWorking ] = useState(false);
    const [ form ] = useForm();
    
    const toggleShowInput = () => { setShowInput(!showInput); }

    const onAnswerClick = () => {
        form.validateFields().then( values => {
            setWorking(true);

            setTimeout( _ => {
                const mparam:IActivitiesReplyToProps = { docId, activityId, answer: values.answer };

                Meteor.call(`__app.${appId}.activities.replyTo`, mparam, (err: Meteor.Error, res: IMethodStatus) => {
                    setWorking(false);
                    
                    if (err) {
                        return message.error('Es ist ein unbekannter Systemfehler aufgetreten. Bitte wenden Sie sich an den Systemadministrator.' + err.message);
                    }

                    if (res.status !== EnumMethodResult.STATUS_OKAY) {
                        return message.warning('Es ist ein Fehler beim Speichern Ihrer Antwort aufgetreten. ' + res.statusText);
                    }
                    
                    toggleShowInput();
                });
            }, 100);
        })
    }

    return (
        <Fragment>
            <span key="1" onClick={ toggleShowInput }>Antworten</span>
            { !showInput ? null : 
                <Form form={form}>
                    <Form.Item
                        name="answer"
                        rules={[
                            {
                                required: true,
                                message: 'Bitte geben Sie eine Antwort ein.',
                            },
                        ]}
                    >
                        <MentionsWithEmojis 
                            method={`__app.${appId}.getUsersSharedWith`}
                            methodParams={{appId, docId, activityId}}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button onClick={onAnswerClick} loading={working} disabled={working} type="primary">
                            Antworten
                        </Button>
                    </Form.Item>
                </Form>
            }
        </Fragment>
    );
}