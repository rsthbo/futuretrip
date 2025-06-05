import { Colors } from '/imports/api/colors'
import { TOptionValues } from '/imports/api/types/app-types';

export const Seminarstati: TOptionValues = [
    { _id: 'geplant', title:'geplant', ...Colors.blue }, 
    { _id: 'bestätigt', title:'bestätigt',  ...Colors.orange },
    { _id: 'abgesagt', title:'abgesagt',  ...Colors.red },
    { _id: 'durchgeführt', title:'durchgeführt', ...Colors.green },
    { _id: 'abgerechnet', title: 'abgerechnet', ...Colors.grey }
];