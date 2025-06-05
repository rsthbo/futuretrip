import { Colors } from '/imports/api/colors'
import { TOptionValues } from '/imports/api/types/app-types';

export const Teilnehmerstati: TOptionValues  = [
    { _id: 'angemeldet', title:'angemeldet', ...Colors.blue }, 
    { _id: 'bestätigt', title:'bestätigt',  ...Colors.orange },
    { _id: 'abgesagt', title:'abgesagt',  ...Colors.red },
    { _id: 'teilgenommen', title:'teilgenommen', ...Colors.green },
    { _id: 'abgerechnet', title: 'abgerechnet', ...Colors.grey },
    { _id: 'angebot', title:'angeboten', ...Colors.cyan }, 
];