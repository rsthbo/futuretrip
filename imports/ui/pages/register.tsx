import { Meteor } from 'meteor/meteor';

import React, { Fragment } from 'react';

import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Button from 'antd/lib/button';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';

import Modal from 'antd/lib/modal';
import notification from 'antd/lib/notification';
import Select from 'antd/lib/select';
import Checkbox from 'antd/lib/checkbox';
import Steps from 'antd/lib/steps';
import Result from 'antd/lib/result';

const { Step } = Steps;

import UserOutlined from '@ant-design/icons/UserOutlined';
import LockOutlined from '@ant-design/icons/LockOutlined';

import { EnumMethodResult } from '/imports/api/consts';
import { useAccount, useLoginDefinition } from '/client/clientdata';
import { useState } from 'react';
import { IRegisterResult, IRegisterUserData } from '/imports/api/lib/world';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { IMethodStatus } from '/imports/api/types/world';


const layout = {
    labelCol: {
        span: 8,
    },
    wrapperCol: {
        span: 16,
    },
};

const WAIT_FOR_VERIFICATION = 4;

export const RegisterPage = () => {
    const { status, loginDefinition } = useLoginDefinition();

    const [ disabledAll, setDisabledAll] = useState(false);
    const [ agbChecked, setAGBChecked] = useState(false);
    const [ datenschutzChecked, setDatenschutzChecked] = useState(false);
    const [ currentStep, setCurrentStep] = useState(0);
    const [ form ] = Form.useForm();

    const { accountVerified } = useAccount();

    const [ formData, setFormData ] = useState({});
    

    if (currentStep == WAIT_FOR_VERIFICATION && accountVerified) {
        FlowRouter.go('/');
        return null;
    }

    const registerAccount = (data: IRegisterUserData): void => {
        let userData = { ...formData, ...data };
        delete userData.password1;
        
        setDisabledAll(true);

        Meteor.call('__world.registerUser', userData, (error: Error | Meteor.Error | Meteor.TypedError, result: IRegisterResult) => {
            if (error) {
                setDisabledAll(false);
                return Modal.error({
                    title: 'Registrierung fehlgeschlagen',
                    content: error.message,
                });
            }

            if (result.status != EnumMethodResult.STATUS_OKAY) {
                setDisabledAll(false);
                return Modal.error({
                    title: 'Registrierung fehlgeschlagen',
                    content: result.statusText,
                });
            }

            setCurrentStep(WAIT_FOR_VERIFICATION);
            Meteor.loginWithPassword({ email: userData.email }, userData.password, (error?: Error | Meteor.Error | Meteor.TypedError) => {
                if (error) {
                    setDisabledAll(false);

                    notification.warning({
                        message: 'Fehlerhafte Anmeldung',
                        description: error.message
                    });
                }
            });
        });
    };

    const changeAGBCheck = (e: { target: { checked:boolean } }): void => {
        setAGBChecked(e.target.checked);
    }
    const changeDatenschutzCheck = (e: { target: { checked:boolean } }): void => {
        setDatenschutzChecked(e.target.checked);
    }
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
        if (currentStep < nextStep) {
            // go forward only when everything is fine
            form.validateFields().then( (values:any) => {
                setFormData({ ...formData, ...values});
                setCurrentStep(nextStep);
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
            <Form.Item
                label="E-Mailadresse"
                name="email"
                validateTrigger="onBlur"
                rules={[
                    { required: true, message: 'Bitte geben Sie Ihren Benutzernamen ein.' },
                    () => ({
                        validator(_, value) {
                            return new Promise( (resolve, reject) => {
                                Meteor.call('__world.checkUserByEMailAlreadyInUse', value, (err:Error, result: IMethodStatus) => {
                                    if (err) return reject(
                                        new Error('Fehler aufgetreten. ' + err.message)
                                    );
                                    if (result.status == EnumMethodResult.STATUS_ABORT) {
                                        reject(
                                            new Error(result.statusText as string)
                                        );
                                    }
                                    
                                    return resolve(null);
                                });
                            })
                        },
                    }),
                ]}
            >
                <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Benutzer" autoComplete="new-user"/>
            </Form.Item>

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
        </Fragment>,
        
        <Fragment>
            <Form.Item
                label="Anrede"
                name="gender"
                rules={[
                    { required: true, message: 'Bitte geben Sie Ihren Vornamen ein.' },
                ]}
            >
                <Select placeholder="Anrede">
                    <Select.Option key="herr" value="herr">Herr</Select.Option>
                    <Select.Option key="frau" value="frau">Frau</Select.Option>
                    <Select.Option key="divers" value="divers">Divers</Select.Option>
                </Select>
            </Form.Item>

            <Form.Item
                label="Vorname"
                name="firstName"
                rules={[
                    { required: true, message: 'Bitte geben Sie Ihren Vornamen ein.' },
                ]}
            >
                <Input placeholder="Vorname"/>
            </Form.Item>

            <Form.Item
                label="Nachname"
                name="lastName"
                rules={[
                    { required: true, message: 'Bitte geben Sie Ihren Nachnamen ein.' },
                ]}
            >
                <Input placeholder="Nachname"/>
            </Form.Item>
        </Fragment>,

        <Fragment>       
            <Form.Item
                label="Firma"
                name="company"
                rules={[
                    { required: true, message: 'Bitte geben Sie Ihren Arbeitgeber ein.' },
                ]}
            >
                <Input placeholder="Unternehmen"/>
            </Form.Item>

            <Form.Item
                label="Straße"
                name="street"
                rules={[
                    { required: true, message: 'Bitte geben Sie die Straße ein.' },
                ]}
            >
                <Input placeholder="Straße"/>
            </Form.Item>
            
            <Form.Item
                label="Postleitzahl"
                name="postalcode"
                rules={[
                    { required: true, message: 'Bitte geben Sie die Postleitzahl ein.' },
                ]}
            >
                <Input placeholder="PLZ"/>
            </Form.Item>
            <Form.Item
                label="Ort"
                name="city"
                rules={[
                    { required: true, message: 'Bitte geben Sie den Ort ein.' },
                ]}
            >
                <Input placeholder="Ort"/>
            </Form.Item>
            <Form.Item
                label="Land"
                name="countryCode"
                rules={[
                    { required: true, message: 'Bitte geben Sie das Land an.' },
                ]}
            >
                <Select placeholder="Land" /*defaultValue="DE"*/>
                    <Select.Option key="DE" value="DE">Deutschland</Select.Option>
                    <Select.Option key="AT" value="AT">Österreich</Select.Option>
                    <Select.Option key="CH" value="CH">Schweiz</Select.Option>
                    <Select.Option key="FR" value="FR">Frankreich</Select.Option>
                    <Select.Option key="LU" value="LU">Luxemburg</Select.Option>
                    <Select.Option key="BE" value="BE">Belgien</Select.Option>
                    <Select.Option key="NL" value="NL">Niederlande</Select.Option>
                </Select>

            </Form.Item>
        </Fragment>,

        <Fragment>
            <Form.Item wrapperCol={{lg:{ offset: 8, span: 16 }, xl:{ offset: 8, span: 16 }, xxl:{ offset: 8, span: 16 }}} >
                <div>Wir benötigen Ihre Zustimmung!</div>
            </Form.Item>

            <Form.Item wrapperCol={{lg:{ offset: 8, span: 16 }, xl:{ offset: 8, span: 16 }, xxl:{ offset: 8, span: 16 }}}
                name="datenschutzChecked"
                valuePropName="checked" 
                //noStyle
            >                        
                <Checkbox onChange={changeDatenschutzCheck} >Ich stimme den <a href="https://mebedo-ac.de/datenschutz" target="_blank">Datenschutzbestimmungen</a> zu</Checkbox>
            </Form.Item>
            
            <Form.Item wrapperCol={{lg:{ offset: 8, span: 16 }, xl:{ offset: 8, span: 16 }, xxl:{ offset: 8, span: 16 }}}
                name="agbChecked"
                valuePropName="checked" 
                //noStyle
            >                        
                <Checkbox onChange={changeAGBCheck} >Ich habe die <a href="https://mebedo-ac.de/agb" target="_blank">AGB</a> gelesen und stimme diesen zu</Checkbox>
            </Form.Item>
        </Fragment>,

        <Fragment>
            <Result
                className="mbac-registration-success"
                status="success"
                title="Registrierung abgeschlossen"
                subTitle="Ihr Zugang wurde erfolgreich erstellt."
            >
                <div className="mbac-registration-success-moreinfo">
                    <h4>Wir warten auf Ihre Bestätigung!</h4>
                    <p>
                        Hierzu haben wir Ihnen eine E-Mail gesandt mit der Bitte Ihren Zugang und Ihre E-Mailadresse zu bestätigen.
                        Bitte führen Sie zur Bestätigung den Link in dieser E-Mai aus. Sobald die Bestätigung durchgeführt ist werden Sie automatisch angemeldet und weitergeleitet.
                    </p>
                </div>
            </Result>
        </Fragment>
    ];

    return (
        <Row className="mbac-register">
            <Col className="mbac-register-data" xs={{offset:2, span:20}} sm={{offset:2, span:20}} md={{offset:4, span:16}} lg={{offset:6, span:12}} xl={{offset:4, span:16}}>                
                { !loginDefinition.imageUrl ? null :
                    <div className="mbac-login-image">
                        <img src={loginDefinition?.imageUrl} />
                    </div>
                }
                
                { currentStep >= WAIT_FOR_VERIFICATION ? null :
                    <Fragment>
                        <h1 className="mbac-welcome">Registrierung</h1>                
                        <p className="mbac-introduction">Bitte geben Sie im nachfolgenden Ihre Benutzerdaten ein und bestätigen Sie Ihren Zugang.</p>

                        <Steps className="mbac-register-steps" current={currentStep} onChange={onStepChange}>
                            <Step title="Login" description="E-Mail und Kennwort" />
                            <Step title="Benutzer" description="persönlichen Daten" />
                            <Step title="Unternehmen" description="Angaben zum Arbeitgeber" disabled={currentStep < 1 } />
                            <Step title="Zustimmung" description="AGB's und Datenschutz" disabled={currentStep < 2 }/>
                            <Step title="Bestätigung" disabled={true}/>
                        </Steps>
                    </Fragment>
                }

                <Form
                    {...layout}
                    form={form}
                    name="registerForm"
                    onFinish={registerAccount}
                >
                    <div className="mbac-current-step-content">
                        { stepContent[currentStep] }
                    </div>

                    { currentStep >= WAIT_FOR_VERIFICATION ? null :
                        <div className="mbac-register-btn">
                            <Button type="default" onClick={()=>history.back()} disabled={disabledAll}>Abbruch</Button>
                            <Button type="default" onClick={()=>validateAndGo(currentStep-1)} disabled={disabledAll || currentStep==0}>Zurück</Button>
                            <Button type="default" onClick={()=>validateAndGo(currentStep+1)} disabled={disabledAll || currentStep==3}>Weiter</Button>
                            <Button type="primary" htmlType="submit" disabled={disabledAll || !agbChecked || !datenschutzChecked || currentStep < 3}>Jetzt Zugang erstellen</Button>
                        </div>
                    }
                </Form>
            </Col>
        </Row>
    );
};