import { Colors } from '/imports/api/colors'
import { TOptionValues, IOptionValue } from '/imports/api/types/app-types';

export type TEinheit = IOptionValue<EinheitenEnum> & { options: {
    /**
     * Beschreibt den Umrechnungsfaktor für die Einheit
     * um von der Basiseinheit Minuten auf die tatsächliche Einheit
     * zu kommen
     */
    minuteFactor: number
    /**
     * Gibt die Anzahl der Nachkommastellen an,
     * mit der die Einheit verwaltet wird
     */
    precision: number
}}

/**
 * Berechnet die Minuten, gemäß dem angegeben Aufwand unter Berücksichtigung der
 * Einheit und Projektstunden je Beratertag
 * 
 * @param aufwand Aufwand gemäß Einheit
 * @param einheit Einheit in der der Aufand betrachtet werden soll
 * @param stdProTag Projektstunden je Beratertag, die im Projekt definiert sind
 * @returns Anzahl der Minuten als kleinste Einheit
 */
export const calcMinutes = ( aufwand: number, einheit: TEinheit, stdProTag:number ): number => {
    const { _id, options } = einheit;
    const { minuteFactor } = options;
    
    if (_id == 'tage') {
        return aufwand * minuteFactor * stdProTag;    
    }

    return aufwand * minuteFactor;
}

export enum EinheitenEnum {
    minuten = 'minuten',
    stunden = 'stunden',
    tage = 'tage'
}

export const Einheiten: TOptionValues<EinheitenEnum> = [
    { _id: EinheitenEnum.minuten, title:'Minute', pluralTitle: 'Minuten', ...Colors.orange, options: { minuteFactor: 1, precision: 0 } },
    { _id: EinheitenEnum.stunden, title:'Stunde', pluralTitle: 'Stunden', ...Colors.blue, options: { minuteFactor: 60, precision: 3 } }, 
    { _id: EinheitenEnum.tage, title:'Tag', pluralTitle: 'Tage',  ...Colors.red, options: { minuteFactor: 60, precision: 5 } },
];

export enum RabattEinheitenEnum {
    prozent = 'proz',
    betrag = 'betrag'
}

export const Rabatteinheiten: TOptionValues<RabattEinheitenEnum> = [
    { _id: RabattEinheitenEnum.prozent, title:'Prozentual (%)', ...Colors.yellow },
    { _id: RabattEinheitenEnum.betrag, title:'Betrag (€)', ...Colors.blue },
]