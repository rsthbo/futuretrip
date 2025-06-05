import React, { Fragment/*, useState, useMemo */} from 'react';
import { Meteor } from 'meteor/meteor';

import { EnumDocumentModes, EnumMethodResult } from '/imports/api/consts';
import { IGenericDocument } from '/imports/api/lib/core';
import { debounce } from '/imports/api/lib/basics';

import Button from 'antd/lib/button';
import Image from 'antd/lib/image';
import List from 'antd/lib/list';
import Select from 'antd/lib/select';
import Spin from 'antd/lib/spin';
import message from 'antd/lib/message';
import Typography from 'antd/lib/typography';

const { /*Text,*/ Link } = Typography;

import CloseOutlined from '@ant-design/icons/CloseOutlined';

const { Option } = Select;

import { IApp, IAppField, IAppLayoutElementAppLink, IAppLink, IGenericAppLinkOptionsResult } from '/imports/api/types/app-types';
import { GenericControlWrapper, IGenericControlProps } from './generic-control-wrapper';

export interface IAppLinkControlProps {
    appId: string
    fieldId: string
    
    mode: EnumDocumentModes,
    
    value?: Array<any>,

    targetAppId: string
    onChange?: (newValues:Array<{[key:string]:any}>) => void,

    hasDescription: boolean,
    hasImage: boolean,
    linkable: boolean,
    disabled?: boolean,
    maxItems: number
}

export interface IAppLinkControlState {
    currentInput: string,
    value: Array<any> | undefined,
    fetching: boolean,
    options: Array<IGenericDocument> | undefined
}

export class GenericAppLinkInput extends React.Component<IAppLinkControlProps, IAppLinkControlState> {
    private onSearch: () => void;

    constructor(props: IAppLinkControlProps) {
        super (props);

        const { appId, targetAppId, fieldId } = props;

        this.state = {
            currentInput: '',
            value: props.value || [],
            fetching: false,
            options: []
        }

        this.onSearch = debounce( (currentInput: string) => {
            const { value } = this.state;

            Meteor.call('__app.' + targetAppId + '.getAppLinkOptions', { appId, fieldId, currentInput, values: value }, (err:Meteor.Error, result: IGenericAppLinkOptionsResult) => {
                if (err) {
                    message.error('Es ist ein unbekannter Systemfehler aufgetreten. Bitte wenden Sie sich an den Systemadministrator.' + err.message);
                    this.setState({ fetching: false });
                } else {
                    if (result.status == EnumMethodResult.STATUS_OKAY) {
                        this.setState({ options: result.options, fetching: false });
                    } else {
                        this.setState({ options: result.options, fetching: false });
                    }
                }
            });
        }, 600, false, () => {
            this.setState({ fetching: true });
        });
    }

    componentDidUpdate(prevProps:IAppLinkControlProps, _prevState: IAppLinkControlState) {
        if (prevProps.value !== this.props.value) {
            this.setState({ value: this.props.value });
        }
    }

    onSelectChange(selectedId: string) {
        const { options, value } = this.state;
        //const { targetProductId, targetAppId } = this.props;

        const found: any = options && options.find( i => i._id === selectedId );
        
        const newValues = value && value.concat([{ 
            _id: selectedId, 
            title: found.title,
            imageUrl: found.imageUrl,
            description: found.description,
            link: found.link
        }]) || [];
        this.setState({ value: newValues, currentInput: '' });

        const { onChange } = this.props;

        if (onChange) onChange(newValues);
    }

    removeSeletedItem({ _id }:{_id:string}) {
        const { value } = this.state;
        const { onChange } = this.props;

        const newValues = value && value.filter( item => _id !== item._id);
        this.setState({ value: newValues });

        if (onChange) onChange(newValues || []);
    }

    render() {
        const { currentInput, value, options, fetching } = this.state;
        const { hasDescription, hasImage, linkable, mode, disabled, maxItems = 999 } = this.props;

        const onSearch = this.onSearch.bind(this);
        const onChange = this.onSelectChange.bind(this);
        const removeSeletedItem = this.removeSeletedItem.bind(this);

        const getActionButtons = (item:any):Array<React.ReactNode>|undefined => {
            if (!disabled && (mode === EnumDocumentModes.EDIT || mode === EnumDocumentModes.NEW)) 
                return [
                    <Button type="link" onClick={ _ => removeSeletedItem(item) } icon={<CloseOutlined />} ></Button>
                ]
            return;
        };

        return <Fragment>
            <List
                locale={{emptyText: 'Bitte auswählen'}}
                className="module-list-input-selected-items"
                itemLayout="horizontal"
                dataSource={ value }
                renderItem={ item => 
                    <List.Item 
                        actions={getActionButtons(item)}
                    >
                        <List.Item.Meta
                            avatar={hasImage ? <Image preview={false} src={item.imageUrl} width={48} /> : null}
                            title={
                                (linkable && item.link) ? <Link href={item.link}>{item.title}</Link> : <span>{item.title}</span>
                            }
                            description={(hasDescription ? <span style={{fontSize:10}}>{item.description}</span> : null)}
                        />
                    </List.Item>
                }
            />

            { disabled || mode === 'SHOW' || (value || []).length >= maxItems ? null :
                <Select
                    showSearch
                    value={currentInput}
                    filterOption={false}
                    onSearch={onSearch}
                    onChange={onChange}
                    loading={fetching}
                    notFoundContent={fetching ? <Spin size="small" /> : null}
                >
                    { 
                        options && options.map( ({ _id, title, imageUrl, description }) => {
                            return (
                                <Option key={_id} value={_id}>
                                    { hasImage ? <Image src={imageUrl} width={48} style={{marginRight:8}} /> : null }
                                    <span>{title}</span>
                                    { hasDescription ? <br /> : null }
                                    { hasDescription ? <span style={{fontSize:10,color:'#ccc'}}>{description}</span> : null }
                                </Option>
                            );
                        })
                    }
                </Select>
            }
        </Fragment>
    }
}

/**
 * @deprecated
 */
export const SingleModuleOption = (props: IGenericControlProps) => {
    const { elem, app, mode } = props;
    const { _id: appId, fields } = app as IApp<any>;
    
    const fieldDefinition: IAppField<any> = fields[elem?.field as string];
    const appLink: IAppLink<any> = fieldDefinition.appLink as IAppLink<any>;

    const targetAppId: string = appLink.app as unknown as string;

    return (
        <GenericControlWrapper {...props} className="mbac-input mbac-app-link">
            <GenericAppLinkInput
                appId={appId as string}
                fieldId={elem?.field as string}

                targetAppId={targetAppId}

                mode={mode}
                
                hasDescription={appLink.hasDescription}
                hasImage={appLink.hasImage}
                linkable={appLink.linkable}

                maxItems={1}
            />
        </GenericControlWrapper>
    )
}

export const AppLinkInput = (props: IGenericControlProps) => {
    const elem = props.elem as IAppLayoutElementAppLink<any>;
    const { app, mode } = props;
    const { _id: appId, fields } = app as IApp<any>;
    
    const fieldDefinition: IAppField<any> = fields[elem.field as string]; 
    const appLink: IAppLink<any> = fieldDefinition.appLink as IAppLink<any>;

    const targetAppId: string = appLink.app as unknown as string;

    return (
        <GenericControlWrapper {...props} className="mbac-input mbac-app-link">
            <GenericAppLinkInput
                appId={appId as string}
                fieldId={elem.field as string}

                targetAppId={targetAppId}

                mode={mode}
                
                hasDescription={appLink.hasDescription}
                hasImage={appLink.hasImage}
                linkable={appLink.linkable}

                maxItems={elem.maxItems || 1}
            />
        </GenericControlWrapper>
    )
}