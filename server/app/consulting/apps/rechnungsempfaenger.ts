import { Colors } from '/imports/api/colors'
import { TOptionValues } from '/imports/api/types/app-types';

export enum RechnungsempfaengerEnum {
    kunde = 'kunde',
    abwweichend = 'abweichend',
    distributor = 'distributor'
}

export const Rechnungsempfaenger: TOptionValues<RechnungsempfaengerEnum> = [
    { _id: RechnungsempfaengerEnum.kunde, title:'Kundenanschrift gemäß Stammdaten', ...Colors.green },
    { _id: RechnungsempfaengerEnum.abwweichend, title:'abweichende Rechnungsanschrift für dieses Projekt', ...Colors.blue }, 
    { _id: RechnungsempfaengerEnum.distributor, title:'Distributor',  ...Colors.orange },
];