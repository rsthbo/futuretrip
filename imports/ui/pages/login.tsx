import { Meteor } from 'meteor/meteor';

import React from 'react';

import Form, { FormProps } from 'antd/lib/form';
import Input from 'antd/lib/input';
import Button from 'antd/lib/button';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Divider from 'antd/lib/divider';
import Modal from 'antd/lib/modal';
import Space from 'antd/lib/space';
import Skeleton from 'antd/lib/skeleton';

import UserOutlined from '@ant-design/icons/UserOutlined';
import LockOutlined from '@ant-design/icons/LockOutlined';

import { EnumMethodResult } from '/imports/api/consts';
import { useLoginDefinition } from '/client/clientdata';



const layout = {
    labelCol: {
        span: 8,
    },
    wrapperCol: {
        span: 16,
    },
};

const tailLayout = {
    wrapperCol: {
        offset: 8,
        span: 16,
    },
};

export const LoginPage = () => {
    const { status, statusText, loginDefinition } = useLoginDefinition();

    const loginWithPassword = (data: { username: string, password: string }): void => {
        const username = data.username && data.username.toLowerCase();

        Meteor.loginWithPassword(username, data.password, err => {
            if (err) {
              Modal.error({
                  title: 'Login fehlgeschlagen',
                  content: 'Bitte überprüfen Sie Ihren Benutzernamen und/oder Passwort und versuchen Sie es erneut.',
              });  
            }
        });
    };

    const loginWithGoogle = (): void => {
        Meteor.loginWithGoogle({}, (error?: Error | Meteor.Error | Meteor.TypedError) => {
            if (error) {
                Modal.error({
                    title: 'Login fehlgeschlagen',
                    content: 'Bitte überprüfen Sie Ihren Benutzernamen und/oder Passwort und versuchen Sie es erneut.',
                });
            }
        });
    }
    const loginWithFacebook = (): void => {

    }

    if (status == EnumMethodResult.STATUS_LOADING || !loginDefinition) {
        return <Skeleton />
    }

    const { register, forgotPassword } = loginDefinition;

    return (
        <Row className="mbac-login">
            <Col className="mbac-login-data" xs={{offset:2, span:20}} sm={{offset:2, span:20}} md={{offset:4, span:16}} lg={{offset:6, span:12}} xl={{offset:8, span:8}}>
                { !loginDefinition.imageUrl ? null :
                    <div className="mbac-login-image">
                        <img src={loginDefinition?.imageUrl} />
                    </div>
                }
                { !loginDefinition.welcome ? null :
                    <h1 className="mbac-welcome">{loginDefinition.welcome}</h1>
                }
                { !loginDefinition.introduction ? null :
                    <p className="mbac-introduction">{loginDefinition.introduction}</p>
                }

                { !loginDefinition.with.password ? null :
                    <Form
                        {...layout}
                        name="LoginForm"
                        onFinish={loginWithPassword}
                    >
                        <Form.Item
                            label="Benutzername"
                            name="username"
                            rules={[
                                { required: true, message: 'Bitte geben Sie Ihren Benutzernamen ein.' },
                            ]}
                        >
                            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Benutzer"/>
                        </Form.Item>

                        <Form.Item
                            label="Passwort"
                            name="password"
                            rules={[
                                {required: true, message: 'Bitte geben Sie Ihr Passwort ein.' },
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} placeholder="Passwort"/>
                        </Form.Item>

                        <div className="mbac-loginwith-password">
                            <Button type="primary" htmlType="submit">Anmelden</Button>

                            { !register ? null :
                                    <a className="mbac-register" href="/register">{register === true ? 'Jetzt Registrieren' : register}</a>
                            }
                            { !forgotPassword ? null :
                                <a className="mbac-forgot-password" href="/forgot-password">{forgotPassword === true ? 'Passwort vergessen?' : forgotPassword}</a>
                            }
                        </div>
                    </Form>
                }

                <div className="mbac-alternate-loginservices">
                    { !loginDefinition.with.password ? null :
                        <Divider orientation="center">oder</Divider>
                    }

                    <Button className="mbac-btn mbac-loginwith-google" type="default" onClick={loginWithGoogle}>
                        <Space>
                            <img width="18px" src="/google-logo.png" />
                            <span>anmelden mit Google</span>
                        </Space> 
                    </Button>

                    <Button className="mbac-btn mbac-loginwith-facebook" type="default" onClick={loginWithFacebook}>
                        <Space> 
                            <img width="18px" src="/facebook.svg" />
                            <span>anmelden mit Facebook</span>
                        </Space> 
                    </Button>
                </div>
            </Col>
        </Row>
    );
};

/*<Form.Item {...tailLayout}>
<Space>
    <Button type="primary" htmlType="submit">Anmelden</Button>
    { !loginDefinition.register ? null :
        <a href="/register">{loginDefinition.register === true ? 'Jetzt Registrieren' : loginDefinition.register}</a>
    }
    { !loginDefinition.forgotPassword ? null :
        <a href="/forgot-password">Passwort vergessen?</a>
    }
</Space>
</Form.Item>*/
