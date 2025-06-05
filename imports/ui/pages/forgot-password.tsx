import { Meteor } from 'meteor/meteor';

import React, { Fragment } from 'react';

import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Button from 'antd/lib/button';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';

import Modal from 'antd/lib/modal';
import notification from 'antd/lib/notification';
import Steps from 'antd/lib/steps';
import Result from 'antd/lib/result';
import Alert from 'antd/lib/alert';

const { Step } = Steps;

import UserOutlined from '@ant-design/icons/UserOutlined';
import LockOutlined from '@ant-design/icons/LockOutlined';

import { EnumMethodResult } from '/imports/api/consts';
import { useAccount, useLoginDefinition } from '/client/clientdata';
import { useState } from 'react';
import { IRegisterResult } from '/imports/api/lib/world';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Accounts } from 'meteor/accounts-base';


const layout = {
    labelCol: {
        span: 8,
    },
    wrapperCol: {
        span: 16,
    },
};

const WAIT_FOR_VERIFICATION = 4;

export const ForgotPassword = () => {
    const { status, loginDefinition } = useLoginDefinition();
    const { accountVerified } = useAccount();
    
    const [ disabledAll, setDisabledAll] = useState(false);
    const [ currentStep, setCurrentStep] = useState(0);
    const [ form ] = Form.useForm();

    const [ formData, setFormData ] = useState<{token?:string, email?:string}>({});
    

    if (currentStep == WAIT_FOR_VERIFICATION && accountVerified) {
        FlowRouter.go('/');
        return null;
    }

    const sendForgotPasswordMail = (data: { email: string }, nextStep: number): void => {
        let { email } = data;
        
        setDisabledAll(true);
        
        Meteor.call('__world.sendForgotPasswordMail', email, (error: Error | Meteor.Error | Meteor.TypedError, result: IRegisterResult) => {
            setDisabledAll(false);

            if (error) {
                return Modal.error({
                    title: 'Unerwarteter Fehler!',
                    content: error.message,
                });
            }

            if (result.status != EnumMethodResult.STATUS_OKAY) {
                return Modal.error({
                    title: 'Fehler aufgetreten',
                    content: result.statusText,
                });
            }

            setCurrentStep(nextStep);
        });
    };

    const checkResetPasswordToken = (data: { token: string }, nextStep: number): void => {
        let { token } = data;
        
        setDisabledAll(true);
        
        Meteor.call('__world.checkResetPasswordToken', token, (error: Error | Meteor.Error | Meteor.TypedError, result: IRegisterResult) => {
            setDisabledAll(false);

            if (error) {
                return Modal.error({
                    title: 'Unerwarteter Fehler!',
                    content: error.message,
                });
            }

            if (result.status != EnumMethodResult.STATUS_OKAY) {
                return notification.error({
                    message: 'Code ungültig',
                    description: result.statusText,
                });
            }

            setCurrentStep(nextStep);
        });
    };

    const resetPassword = (data: { token: string, password: string }): void => {
        let { token, password } = data;
        
        console.log(token , password);
        setDisabledAll(true);
        
        Accounts.resetPassword(token, password, err => {
            console.log('Reset', err, token , password);
            if (err) {
                return notification.error({
                    message: 'Unerwarteter Fehler',
                    description: err.name + ' ' + err.message
                });
            }

            notification.success({
                message: 'Passwort aktualisiert',
                description: 'Ihr Passwort wurde erfolgreich aktualisiert.'
            });
            FlowRouter.go('/');
        });
    };


    const onStepChange = (nextStep:number) => {
        if (currentStep + 1 == nextStep) {
            // one step forward will be okay
            return validateAndGo(nextStep)
        } else if (nextStep < currentStep) {
            // backward will alway be fine
            setCurrentStep(nextStep);
        }
    }

    const validateAndGo = (nextStep:number) => {
        console.log('validateAndGo', currentStep, nextStep)
        if (currentStep < nextStep) {
            // go forward only when everything is fine
            form.validateFields().then( (values:any) => {
                setFormData({ ...formData, ...values});

                if (currentStep == 0) {
                    sendForgotPasswordMail({ email: values.email }, nextStep);
                } else if ( currentStep == 1) {
                    checkResetPasswordToken({ token: values.token }, nextStep);
                } else if ( currentStep == 2) {
                    resetPassword({ token: formData.token as string, password: values.password });
                }
            }).catch(err => {
                console.log('validateAndGo Error', err);
            });
        } else {
            // backward
            setCurrentStep(nextStep);
        }
    }

    if (status == EnumMethodResult.STATUS_LOADING || !loginDefinition) {
        return null;
    }

    
    const stepContent = [
        <Fragment>
            <Alert
                className="mbac-step-explanation"
                description='Bitte geben Sie Ihre E-Mailadresse an und bestätigen Sie Ihre Eingabe mit der Schaltfläche "Passwort zurücksetzen".'
                type="info"
                showIcon
            />
            <Form.Item
                label="E-Mailadresse"
                name="email"
                rules={[
                    { required: true, message: 'Bitte geben Sie Ihren Benutzernamen ein.' },
                ]}
            >
                <Input prefix={<UserOutlined />} placeholder="Benutzer" autoComplete="new-user" disabled={disabledAll}/>
            </Form.Item>

        </Fragment>,

        <Fragment>
            <Alert
                className="mbac-step-explanation"
                message="Wir bitte um Bestätigung"
                description="Bitte geben Sie den per E-Mail erhaltenen Code ein und vergeben anschließend Ihr neues Passwort."
                type="info"
                showIcon
            />
            <Form.Item
                label="Code, Token"
                name="token"
                rules={[
                    { required: true, message: 'Bitte geben Sie den Bestätigungscode ein.' },
                ]}
            >
                <Input disabled={disabledAll}/>
            </Form.Item>
        </Fragment>,

        <Fragment>
            <Result
                className="mbac-registration-success"
                status="success"
                title="Identität bestätigt"
                subTitle="Vielen Dank für die Bestätigung Ihrer Identität."
            />
            <Form.Item
                label="Passwort"
                name="password"
                rules={[
                    {required: true, message: 'Bitte geben Sie Ihr Passwort ein.' },
                ]}
            >
                <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} placeholder="Passwort" autoComplete="new-password"/>
            </Form.Item>
            <Form.Item
                label="Bestätigung Passwort"
                name="password1"
                rules={[
                    {required: true, message: 'Bitte geben Sie Ihr Passwort ein.' },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                                return Promise.resolve();
                            }
            
                            return Promise.reject(new Error('Die Passwortbestätigung ist fehlgeschlagen.'));
                        },
                    }),
                ]}
            >
                <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} placeholder="Bestätigung Passwort" autoComplete="new-password1"/>
            </Form.Item>
        </Fragment>
    ];

    return (
        <Row className="mbac-register">
            <Col className="mbac-register-data" xs={{offset:0, span:24}} sm={{offset:0, span:24}} md={{offset:4, span:16}} lg={{offset:6, span:12}} xl={{offset:8, span:8}}>                
                { !loginDefinition.imageUrl ? null :
                    <div className="mbac-login-image">
                        <img src={loginDefinition?.imageUrl} />
                    </div>
                }
                
                <h1 className="mbac-welcome">Passwort vergessen</h1>                

                <Steps className="mbac-forgot-password-steps" current={currentStep} onChange={onStepChange}>
                    <Step title="EMail" />
                    <Step title="Bestätigung" />
                    <Step title="neues Passwort" />
                </Steps>

                <Form
                    {...layout}
                    form={form}
                    name="restPasswordForm"
                    onFinish={()=>validateAndGo(currentStep+1)}
                >
                    <div className="mbac-current-step-content">
                        { stepContent[currentStep] }
                    </div>

                    { currentStep >= WAIT_FOR_VERIFICATION ? null :
                        <div className="mbac-forgot-password-btn">
                            <Button type="default" onClick={()=>history.back()} disabled={disabledAll}>Abbruch</Button>
                            <Button type="default" onClick={()=>validateAndGo(currentStep-1)} disabled={disabledAll || currentStep==0}>Zurück</Button>
                            <Button type="default" onClick={()=>validateAndGo(currentStep+1)} disabled={disabledAll || currentStep==2}>Weiter</Button>
                            <Button type="primary" htmlType="submit" disabled={disabledAll || currentStep < 2}>Passwort ändern</Button>
                        </div>
                    }
                </Form>        
            </Col>
        </Row>
    );
};