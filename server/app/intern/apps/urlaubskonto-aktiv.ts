import { Colors } from '/imports/api/colors';
import { TOptionValues } from '/imports/api/types/app-types';

export enum UrlaubskontoAktivEnum {
    ja = 'ja',
    nein = 'nein',
    gesperrt = 'gesperrt'
}

export const UrlaubskontoAktiv: TOptionValues<UrlaubskontoAktivEnum> = [
    { _id: UrlaubskontoAktivEnum.ja, title:'Aktiv', ...Colors.green, icon: 'fa fa-check' }, 
    { _id: UrlaubskontoAktivEnum.nein, title:'Inaktiv',  ...Colors.orange, icon: 'fa fa-times' },
    { _id: UrlaubskontoAktivEnum.gesperrt, title:'Gesperrt', ...Colors.red, icon: 'fa fa-ban' },
];