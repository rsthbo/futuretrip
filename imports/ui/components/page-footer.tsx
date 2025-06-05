import React, { Fragment, useState } from 'react'

export type TPageFooterItem = {
    key: string
    icon: string
    title: string
}


export type TPageFooterProps = {
    items: Array<TPageFooterItem>
    activeTab?: string,
    onChange?: (activeTabKey: string) => void
    noTitle?: true
}

export const PageFooter: React.FunctionComponent<TPageFooterProps> = (props) => {
    const { activeTab: defaultActiveTab, onChange, items, noTitle } = props;

    const [ activeTab, setActiveTab ] = useState(defaultActiveTab)

    const activateTab = (tabName: string) => {
        return () => {
            setActiveTab(tabName);
            if (onChange) onChange(tabName);
        }
    }
    
    return <div className="mbac-document-tabs">
        {   items.map( item => {
                const { key, icon, title } = item;

                return <div key={key} className={"mbac-tab" + (activeTab == key ? " active":"")} onClick={activateTab(key)} >
                    <i className={"mbac-tab-icon " + icon} />
                    { !noTitle && <span className="mbac-tab-title">{title}</span> }
                </div>
            })
        }
    </div>
}


export type TTabContentProps = {
    content: Array<{ key: string, content: React.FunctionComponent | JSX.Element}>
    activeContent?: string,
}

export const TabContent: React.FunctionComponent<TTabContentProps> = (props) => {
    const { activeContent, content } = props;

    return <Fragment>
        {   content.map( c => {
                const { key, content } = c;

                return <div key={key} className={"mbac-tab-content" + (activeContent == key ? " active":"")} >
                    { content }
                </div>
            })
        }
    </Fragment>
}