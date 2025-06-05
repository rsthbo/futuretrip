import { Colors } from '/imports/api/colors';
import { TOptionValues } from '/imports/api/types/app-types';

export enum StatusUrlaubsanspruchEnum {
    beantrag = 'beantragt',
    genehmigt = 'genehmigt',
    abgelehnt = 'abgelehnt',
    storniert = 'storniert'
}

export const StatusUrlaubsanspruch: TOptionValues<StatusUrlaubsanspruchEnum> = [
    { _id: StatusUrlaubsanspruchEnum.beantrag, title:'Beantragt', ...Colors.blue, icon: 'fa fa-question' }, 
    { _id: StatusUrlaubsanspruchEnum.genehmigt, title:'Genehmigt',  ...Colors.green, icon: 'fa fa-check' },
    { _id: StatusUrlaubsanspruchEnum.abgelehnt, title:'Abgelehnt', ...Colors.red, icon: 'fa fa-times' },
    { _id: StatusUrlaubsanspruchEnum.storniert, title:'Storno', ...Colors.red, icon: 'fa fa-times' },
];