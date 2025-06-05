import { Colors } from '/imports/api/colors';
import { TOptionValues } from '/imports/api/types/app-types';

export enum AdressartenEnum {
    kunde = 'kunde',
    interessent = 'interessent',
    partner = 'partner',
    hotel = 'hotel',
    distributor = 'distributor',
    sonstiges = 'sonstiges'
}

export const Adressarten: TOptionValues<AdressartenEnum> = [
    { _id: AdressartenEnum.kunde, title:'Kunde', pluralTitle: 'Kunden', ...Colors.blue, icon: 'fa fa-building' }, 
    { _id: AdressartenEnum.interessent, title:'Interessent',  pluralTitle: 'Interessenten', ...Colors.red, icon: 'fa fa-building' },
    { _id: AdressartenEnum.partner, title:'Partner', pluralTitle: 'Partner', ...Colors.green, icon: 'fa fa-handshake' },
    { _id: AdressartenEnum.hotel, title: 'Hotel', pluralTitle: 'Hotels', ...Colors.orange, icon: 'fa fa-bed' },
    { _id: AdressartenEnum.distributor, title: 'Distributor', pluralTitle: 'Distributoren', ...Colors.yellow, icon: 'fa fa-store-alt' },
    { _id: AdressartenEnum.sonstiges, title:'Sonstiges', pluralTitle: 'Sonstige', ...Colors.grey, icon: 'fa fa-questionmark' }, 
];