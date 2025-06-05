import { Colors } from '/imports/api/colors'
import { TOptionValues } from '/imports/api/types/app-types';

export enum JaNeinEnum {
    ja = 'ja',
    nein = 'nein'
}

export const JaNeinOptionen: TOptionValues<JaNeinEnum> = [
    { _id: JaNeinEnum.ja, title:'Ja', ...Colors.green, },
    { _id: JaNeinEnum.nein, title:'Nein', ...Colors.red }, 
];