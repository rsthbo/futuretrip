import { Colors } from '/imports/api/colors'
import { TOptionValues } from '/imports/api/types/app-types';

export enum ProjektstatiEnum {
    geplant = 'geplant',
    bestaetigt = 'bestaetigt',
    abgesagt = 'abgesagt',
    durchgeführt = 'durchgefuehrt',
    abgerechnet = 'abgerechnet'
}

export const Projektstati: TOptionValues<ProjektstatiEnum> = [
    { _id: ProjektstatiEnum.geplant, title:'geplant', ...Colors.blue }, 
    { _id: ProjektstatiEnum.bestaetigt, title:'bestätigt',  ...Colors.orange },
    { _id: ProjektstatiEnum.abgesagt, title:'abgesagt',  ...Colors.red },
    { _id: ProjektstatiEnum.durchgeführt, title:'durchgeführt', ...Colors.green },
    { _id: ProjektstatiEnum.abgerechnet, title: 'abgerechnet', ...Colors.grey }
];