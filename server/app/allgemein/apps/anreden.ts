import { Colors } from '/imports/api/colors';
import { TOptionValues } from '/imports/api/types/app-types';

export const Anreden: TOptionValues = [
    { _id: 'herr', title:'Herr', ...Colors.blue }, 
    { _id: 'frau', title:'Frau',  ...Colors.orange },
    { _id: 'divers', title:'Divers', ...Colors.grey },
];