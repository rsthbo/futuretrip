import { Colors } from "/imports/api/colors";
import { TOptionValues } from "/imports/api/types/app-types";

export enum AbrechnungsmethodenEnum {
    nachAufwand = 'nach Aufwand',
    mitFertigstellung = 'mit Fertigstellung',
    zumFestpreis = 'zum Festpreis',
    ohneBerechnung = 'ohne Berechnung'
}

export const Abrechnungsmethoden: TOptionValues<AbrechnungsmethodenEnum> = [
    { _id: AbrechnungsmethodenEnum.nachAufwand, title:'nach Aufwand', ...Colors.yellow },
    { _id: AbrechnungsmethodenEnum.mitFertigstellung, title:'nach Fertigstellung', ...Colors.blue },
    { _id: AbrechnungsmethodenEnum.zumFestpreis, title:'zum Festpreis', ...Colors.green },
    { _id: AbrechnungsmethodenEnum.ohneBerechnung, title:'ohne Berechnung', ...Colors.red },
]