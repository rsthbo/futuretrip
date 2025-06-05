import React, { Fragment, useState } from 'react'

import Avatar from 'antd/lib/avatar';
import Image from 'antd/lib/image';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';

import { useAvatar } from '/client/clientdata';


export const Expert = ({ user, showFull = true, onlyAvatar }) => {
    if (!user) return null;

    const { userId, firstName, lastName, company, position, qualification, advancedQualification } = user;
    const [ userAvatarLink, isLoadingAvatar ] = useAvatar(userId);

    const getInitials = () => {
        return (firstName && firstName.length > 0)
            ? firstName.substring(0,1) + lastName.substring(0,1)
            : lastName.substring(0,2)
    }
    
    if (onlyAvatar) {
        return userAvatarLink 
            ? <Avatar src={userAvatarLink} />
            : <Avatar style={{ verticalAlign: 'middle' }} >
                { getInitials() }
            </Avatar>
    }

    return (
        <div className="user-avatar-data">
            <Row>
                <Col flex="40px">
                    { userAvatarLink 
                        ? <Avatar src={userAvatarLink} />
                        : <Avatar style={{ verticalAlign: 'middle' }} >
                            { getInitials() }
                          </Avatar>
                    }
                </Col>
                <Col flex="auto">
                    { showFull ? <div className="user-name" style={{marginTop: 6}}>{firstName} {lastName}</div>
                            : null
                    }
                </Col>
            </Row>
            <Row>
                <Col flex="40px">
                    
                </Col>
                <Col flex="auto">
                    <div className="user-data">
                        { position && showFull
                            ? <div className="position" style={{color:'#999'}}>{position}</div>
                            : null
                        }
                        { company && showFull
                            ? <div className="company" style={{color:'#666', fontWeight: 600}}>{company}</div>
                            : null
                        }
                        { qualification && showFull
                            ? <div className="qualification" style={{color:'#999'}}>{qualification}</div>
                            : null
                        }
                        { advancedQualification && showFull
                            ? <div className="advanced-qualification" style={{color:'#999'}}>{advancedQualification}</div>
                            : null
                        }
                    </div>
                </Col>
            </Row>
        </div>
    );
}