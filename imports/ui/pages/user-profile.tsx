import React, { FunctionComponent, useEffect } from 'react';

import PageHeader from 'antd/lib/page-header';
import Breadcrumb from 'antd/lib/breadcrumb';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Select from 'antd/lib/select';

import { useProfile } from '/client/clientdata';

import { IUserData } from '/imports/api/types/world';
import { MethodStatusWrapper } from '../components/method-status';


type TUserProfilePageProps = {
    params: {
        userId: string
    }
}
export const UserProfilePage: FunctionComponent<TUserProfilePageProps> = props => {
    const { userId } = props.params
    const profileSubscription = useProfile(userId);
    
    return (
        <MethodStatusWrapper key="user-profile" subscriptions={[profileSubscription]} >
            <UserProfile profile={profileSubscription.profile as IUserData} />
        </MethodStatusWrapper>
    );
}

type TUserProfileProps = {
    profile: IUserData
}
export const UserProfile: FunctionComponent<TUserProfileProps> = props => {
    const { profile } = props;

    const { firstName, lastName } = profile;
    const displayName = ( firstName ? firstName + ' ' : '' ) + lastName;

    const [userForm] = Form.useForm();

    useEffect( () => {
        userForm.setFieldsValue(profile);
    },[])

    return <div className="mbac-page mbac-record-page">       
        <PageHeader
            className="mbac-page-header"
            title={<span><i className="fa fa-user" style={{fontSize:32, marginRight:16 }}/>{displayName}</span>}
            extra={[]}
            breadcrumb={
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <a href="/">Start</a>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        Benutzer
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        { displayName }
                    </Breadcrumb.Item>
                </Breadcrumb>
            }
        />
        <div className="mbac-page-content">
            <Form
                layout="horizontal"

                labelCol={{ span: 6 }}
                wrapperCol={{ span: 16 }}
                form={userForm}

                preserve={false}
            >
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
            </Form>
        </div>
    </div>;
}
