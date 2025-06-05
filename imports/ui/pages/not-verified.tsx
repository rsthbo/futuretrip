import React from 'react';

import Button from 'antd/lib/button';
import Result from 'antd/lib/result';
import Typography from 'antd/lib/typography';
import Space from 'antd/lib/space';
import Spin from 'antd/lib/spin';
import notification from 'antd/lib/notification';

import CloseCircleOutlined from '@ant-design/icons/CloseCircleOutlined';
import { useAccount } from '/client/clientdata';
import { Meteor } from 'meteor/meteor';
import { IMethodStatus } from '/imports/api/types/world';
import { EnumMethodResult } from '/imports/api/consts';

const {Text, Paragraph} = Typography;

export const NotVerifiedPage = () => {
    const { userId } = useAccount();

    const resendVerificationEMail = () => {        
        if (userId) {
            Meteor.call('__world.sendVerificationEmail', (err: Error, res: IMethodStatus) => {
                if (err) {
                    return notification.error({
                        message: 'Unerwarteter Fehler',
                        description: err.message
                    });
                }
                if (res.status != EnumMethodResult.STATUS_OKAY) {
                    return notification.warning({
                        message: 'Fehler',
                        description: res.statusText
                    });
                }
                notification.success({
                    message: 'E-Mail versandt',
                    description: 'Die E-Mail wurde erneut an die hinterlegte Mailadresse gesandt.'
                });
            })
        }
    }

    return (
        <Result
            className="mbac-verification-missing"

            status="info"
            title="Zugang noch nicht bestätigt"
            subTitle="Ihre E-Mailadresse und Ihr Zugang sind noch nicht bestätigt. Bitte führen Sie vorab die Bestätigung aus."
        >
            <div className="mbac-verification-missing">
                <Paragraph>
                    <Text
                        strong
                        style={{
                            fontSize: 16,
                        }}
                    >
                        Wir haben - an die von Ihnen angegebene E-Mailadresse - eine Nachricht gesandt. Bitte prüfen Sie Ihr E-Mail-Postfach
                        und führen Sie den in der E-Mail enthaltenen Link zur Bestätgung aus.                    
                    </Text>
                </Paragraph>
                <Paragraph>
                    <CloseCircleOutlined style={{color:"red"}} /> Ihr Zugang ist noch gesperrt.
                </Paragraph>
                <Paragraph>
                    <CloseCircleOutlined style={{color:"red"}} /> Ihr Zugang ist noch nicht bestätigt.
                </Paragraph>

                <Paragraph>
                    <Space>
                        <Text strong>
                            Sie haben keine E-Mail erhalten? 
                        </Text>
                        <Button type="default" onClick={resendVerificationEMail} disabled={userId === null}>E-Mail noch einmal zusenden.</Button>
                    </Space>
                </Paragraph>

                <Paragraph>
                    Sobald die Bestätigung abgeschlossen ist werden Sie umgehend weitergeleitet. <Spin />
                </Paragraph>
            </div>
        </Result>
    )
}