import React, { useState, FunctionComponent, Fragment } from 'react';
import Layout from 'antd/lib/layout';
import Menu from 'antd/lib/menu';
import Spin from 'antd/lib/spin';
import Tabs from 'antd/lib/tabs';
import Modal from 'antd/lib/modal';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Button from 'antd/lib/button';
import Drawer from 'antd/lib/drawer';
import notification from 'antd/lib/notification';

import LockOutlined from '@ant-design/icons/LockOutlined';
import MenuUnfoldOutlined from '@ant-design/icons/MenuUnfoldOutlined';

const { TabPane } = Tabs;
const { Header, Content, Sider } = Layout;
const { SubMenu } = Menu;

const USERMENU_PROFILE = 'profile';
const USERMENU_CHANGE_PASSWORD = 'change-password';
const USERMENU_LOGOUT = 'logout';

import { SharedWith } from '/imports/ui/components/shared-with';

import { FlowRouter } from 'meteor/kadira:flow-router';
import { MediaQuery, useMediaQueries } from '/client/mediaQueries';
import { useProducts, useAppsByProduct } from '/client/clientdata';
import { EnumDocumentModes, EnumMethodResult } from '/imports/api/consts';
import { AppActivities } from '../components/app-activities';
import { IProduct, IWorldUser } from '/imports/api/types/world';
import Avatar from 'antd/lib/avatar/avatar';
import { Meteor } from 'meteor/meteor';
import Divider from 'antd/lib/divider';
import { Accounts } from 'meteor/accounts-base';
import { PageFooter, TabContent } from '../components/page-footer';



type TUserMenuProps = {
    /**
     * Specifies the style how to show the user-symbol
     */
    icon: 'avatar' | 'icon' | 'none',
    /**
     * Current user logged in. Result from useAccount().currentUser
     */
    currentUser: IWorldUser
    /**
     * Specifies weather to show the chevron-down icon after 
     * username or not
     */
    chevronDownIcon: boolean
}

const UserMenu: FunctionComponent<TUserMenuProps> = props => {
    const { currentUser, icon, chevronDownIcon } = props;    
    const notReady = (/*!accountsReady || */!currentUser || !currentUser.userData);
    
    const { firstName, lastName } = notReady ? { firstName: 'loading', lastName: '...'} : (currentUser as IWorldUser).userData;
    
    const displayIcon = icon == 'avatar' 
        ? <Avatar>{firstName[0] + lastName[0]} </Avatar> 
        : props.icon == 'icon' 
            ? <i className="fa fa-fw fa-cogs" /> 
            : undefined;

    let propsWithoutCurrentUser: any = {...props};
    delete propsWithoutCurrentUser.currentUser;
    delete propsWithoutCurrentUser.chevronDownIcon;

    return (
        <SubMenu {...propsWithoutCurrentUser}  className="mbac-account-submenu" icon={displayIcon} title={<span>{firstName + ' ' + lastName}{ !chevronDownIcon ? null : <i style={{marginLeft:8}} className="fa fa-chevron-down" />}</span> } disabled={notReady}>
            <Menu.Item key={USERMENU_PROFILE}><span><i className="fa fa-fw fa-user" style={{ marginRight:16 }}/>Profil ändern</span></Menu.Item>
            <Menu.Item key={USERMENU_CHANGE_PASSWORD}><span><i className="fa fa-fw fa-lock" style={{ marginRight:16 }}/>Passwort ändern</span></Menu.Item>
            <Menu.Item key={USERMENU_LOGOUT}><span><i className="fa fa-fw fa-sign-out-alt" style={{ marginRight:16 }}/>Abmelden</span></Menu.Item>
        </SubMenu>
    );
}

const Logo = () => {
    return (
        <div className="mbac-logo" >
            <img className="large" src="/econ.png" />
        </div>
    );
}

interface IProductMenuProps {
    product: IProduct
}

const ProductMenu = (props: IProductMenuProps) => {
    const { product } = props;
    const { apps, status } = useAppsByProduct(product._id as string);

    if (status == EnumMethodResult.STATUS_LOADING || !apps || apps.length == 0)
        return <SubMenu {...props} icon={<i className={product.icon} style={{ marginRight:0 }}/>} title={product.title} />
    
    return (
        <SubMenu {...props} icon={<i className={product.icon} style={{ marginRight:0 }}/>} title={product.title} >
            {
                apps.map( m => 
                    (m as any).isSeparator // TODO: check isSeparator property exists or not????
                        ? <hr key={m._id} style={{width:'80%'}}/> 
                        : <Menu.Item key={m._id}><span><i className={m.icon} style={{ marginRight:16 }}/>{m.title}</span></Menu.Item>
                )
            }
        </SubMenu>
    );
}

type TChangeUserPasswordProps = {
    closeDialog: () => void
}

const ChangeUserPassword: FunctionComponent<TChangeUserPasswordProps> = props => {
    const [disabled, setDisabled] = useState(false);
    const { closeDialog } = props;

    const changePassword = ({oldPassword, password}: {oldPassword: string, password: string}) => {
        setDisabled(true);
        Accounts.changePassword(oldPassword, password, ( err?: Error ) => {
            if (err) {
                setDisabled(false);
                console.log('Change Password failed.', err);
                return notification.error({
                    message: 'Passwort nicht geändert!',
                    description: 'Die Änderung des Passwortes war nicht erfolgreich. Bitte überprüfen Sie Ihre Eingabe und versuchen Sie es erneut.'
                });
            }
            notification.success({
                message: 'Passwort geändert!',
                description: 'Ihr Passwort wurde erfolgreich geändert'
            });
            props.closeDialog();
        });
    }

    return (
        <Form
            labelCol={{span:8}}
            wrapperCol={{span:16}}
            onFinish={changePassword}
        >
            <p className="mbac-intro">
                Bitte geben Sie Ihr altes Kennwort, Ihr neues Kennwort ein und bestätigen anschließend mit der Schaltfläche "Passwort ändern".
            </p>

            <Form.Item
                    label="Altes Passwort"
                    name="oldPassword"
                    rules={[
                        {required: true, message: 'Bitte geben Sie Ihr Passwort ein.' },
                    ]}
            >
                <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} placeholder="Passwort" autoComplete="new-password"/>
            </Form.Item>
            
            <Divider />

            <Form.Item
                    label="Neues Passwort"
                    name="password"
                    rules={[
                        {required: true, message: 'Bitte geben Sie Ihr Passwort ein.' },
                    ]}
            >
                <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} placeholder="Passwort" autoComplete="new-password"/>
            </Form.Item>
            <Form.Item
                label="Bestätigung"
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

            <div className="mbac-button-container">
                <Button type="default" onClick={closeDialog} disabled={disabled}>Abbruch</Button>
                <Button type="primary" htmlType="submit" disabled={disabled}>Passwort ändern</Button>
            </div>
        </Form>        
    )
}

const changeUserPassword = () => {
    const m = Modal.confirm({ 
        title: 'Passwort ändern',
        className: 'mbac-modal-change-password',
        width: 600,
        closable: true,
        okButtonProps: { onClick: () => {}  },
    });

    m.update({
        content: <ChangeUserPassword closeDialog={m.destroy} />
    });
}

interface IProductsMenuProps {
    theme?: 'light' | 'dark',
    mode: 'inline' | 'horizontal'
    displayLogo?: boolean
    currentUser: IWorldUser
    onClick?: () => void;
}

const ProductsMenu = (props: IProductsMenuProps) => {
    const { mode, displayLogo, currentUser, onClick } = props;
    const { products, status } = useProducts();
    const { isPhone } = useMediaQueries();

    const handleClick = ({ keyPath }: { keyPath:Array<string> }) => {
        if (onClick) onClick();

        if (keyPath[1] == 'user') {
            switch (keyPath[0]) {
                case USERMENU_PROFILE:
                    FlowRouter.go('/user/profile/' + currentUser._id);
                    break;

                case USERMENU_CHANGE_PASSWORD:
                    changeUserPassword();
                    break;

                case USERMENU_LOGOUT:
                    Meteor.setTimeout( () => {  Meteor.logout(); }, 100);
                    break;
            }
        } else {
            const route = ('/' + keyPath.reverse().join('/') + '/dashboard').replace('/rc-menu-more', '');
            FlowRouter.go(route);
        }
    }

    if (status == EnumMethodResult.STATUS_LOADING) return <Spin />
    
    return (
        <Menu /*theme={theme}*/ mode={mode} onClick={handleClick} >            
            { !displayLogo ? null :
                <Menu.Item key="mbac-logo" style={{cursor:'unset', opacity:1}} disabled>
                    <Logo />
                </Menu.Item>            
            }
            { isPhone ? <UserMenu key="user" icon="icon" currentUser={currentUser} chevronDownIcon={false} /> : null }
            {
                products?.map( p =>
                    <ProductMenu key={p._id} product={p} /> 
                )
            }
            { 
                isPhone ? null : <Menu.Item key="filler" style={{flexGrow:0.97 /*mit 1 kommt es zu einer Endlosscheife!!*/, cursor:'unset', opacity:1}} disabled></Menu.Item> 
            }
            { isPhone ? null : <UserMenu key="user" icon="avatar" currentUser={currentUser} chevronDownIcon={true} /> }
        </Menu>
    )
}

type TDefaultLayoutProps = {
    currentUser: IWorldUser,
    params?: any,
    showActivities?: boolean,
    mode?: EnumDocumentModes
}

const TAB_DOCUMENT = 'doc';
const TAB_ACTIVITIES = 'act';
const TAB_POSTS = 'post';
const TAB_SHARE = 'shr';


export const DefaultLayout: FunctionComponent<TDefaultLayoutProps> = ( props ) => {
    const { currentUser, params, showActivities = false } = props;
    const [ showSideMenu, setShowSideMenu ] = useState(false);
    const { isPhone } =  useMediaQueries();
    
    const [ activeTab, setActiveTab ] = useState(TAB_DOCUMENT);

    const toggleSideMenu = () => {
        setShowSideMenu(!showSideMenu);
    }  

    const activateTab = (tab: string) => {
        setActiveTab(tab);
    }

    const reallyShowActivities = isPhone ? false : showActivities;

    return (
        <Layout>
            <MediaQuery showAtPhone >
                <Drawer
                    className="mbac-drawer-side-menu"
                    title="Was möchten Sie tun?"
                    width={300}
                    placement="left"
                    closable={true}
                    onClose={toggleSideMenu}
                    visible={showSideMenu}
                >
                    <ProductsMenu theme="dark" mode="inline" currentUser={currentUser} onClick={toggleSideMenu}/>
                </Drawer>
            </MediaQuery>

            <Layout>
                <Header className="mbac-main-header">
                    <MediaQuery showAtPhone >
                        <div className="mbac-header-sm" >
                            { !showSideMenu 
                                ? <Button icon={<MenuUnfoldOutlined />} className="mbac-sidebar-menu-opener" onClick={toggleSideMenu} />
                                : null
                            }
                            <Logo />
                        </div>
                    </MediaQuery>

                    <MediaQuery showAtTablet showAtDesktop >
                        <ProductsMenu displayLogo mode="horizontal" currentUser={currentUser}  />
                    </MediaQuery>
                </Header>

                <Content className={"mbac-main-content" + (isPhone ? " mbac-small-page-header":"") + (reallyShowActivities ? " mbac-has-activities-sider":"") + (showActivities && !reallyShowActivities ? " mbac-has-document-tabs":"")}>
                    { !(showActivities && !reallyShowActivities) ? props.children :
                        <TabContent activeContent={activeTab}
                            content={[
                                { key: TAB_DOCUMENT, content: <Fragment>{props.children}</Fragment> },
                                { key: TAB_ACTIVITIES, content: <div className="mbac-page-scroll-container">
                                        <AppActivities 
                                            currentUser={currentUser}
                                            appId={params && params.appId}
                                            docId={params && params.docId}
                                            mode={props.mode as EnumDocumentModes}
                                        />
                                    </div>
                                },
                                { key: TAB_POSTS, content: <div style={{padding:64}} >Beiträge...</div> },
                                { key: TAB_SHARE, content: <div className="mbac-page-scroll-container">
                                        <SharedWith 
                                            currentUser={currentUser}
                                            appId={params && params.appId}
                                            docId={params && params.docId}
                                            mode={props.mode as EnumDocumentModes}
                                        />
                                    </div>
                                },
                            ]}
                        />
                    }
                </Content>
                
                { !reallyShowActivities
                    ? null
                    : <MediaQuery showAtTablet showAtDesktop >
                        <Sider 
                            className="mbac-activities-sider"
                            theme="light" width="400" collapsible collapsedWidth="0" reverseArrow
                        >
                            
                                <Tabs defaultActiveKey="1" style={{padding:8}} >
                                    <TabPane tab="Aktivitäten" key="1">
                                        <AppActivities 
                                            currentUser={currentUser}
                                            appId={params && params.appId}
                                            docId={params && params.docId}
                                            mode={props.mode as EnumDocumentModes}
                                        />
                                    </TabPane>
                                    <TabPane tab="geteilt mit" key="2">
                                        {<SharedWith 
                                            currentUser={currentUser}
                                            appId={params && params.appId}
                                            docId={params && params.docId}
                                            mode={props.mode as EnumDocumentModes}
                                        />}
                                    </TabPane>
                                </Tabs>
                        </Sider>
                    </MediaQuery>
                }
                { showActivities && !reallyShowActivities 
                    ?   <PageFooter onChange={activateTab} activeTab={activeTab}
                            items={[
                                { key: TAB_DOCUMENT, title: 'Dokument', icon: 'fa fa-file-alt' },
                                { key: TAB_ACTIVITIES, title: 'Aktivitäten', icon: 'fa fa-list' },
                                { key: TAB_POSTS, title: 'Beiträge', icon: 'far fa-comments' },
                                { key: TAB_SHARE, title: 'geteilt mit', icon: 'fa fa-share-alt' },
                            ]}
                            
                        />
                  : null
                }
            </Layout>
        </Layout>
    );
}