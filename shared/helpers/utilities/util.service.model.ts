/**
 * Own
 */
//#region models
import { ITuple } from "../../models";
//#endregion

export interface IUtilService {
    uuidv4(): string;
    getCCExpFormat(expDate: string): string;
    getCardNumberMask(cardNumber: string, withScript: boolean): string;
    getBase64Image(image: HTMLImageElement, onlyDataURL: boolean): string;
    getMonths(qtyFrom?: number): Array<ITuple<any>>;
    getYears(qtyFrom?: number, qtyTo?: number): Array<ITuple<any>>;
    startsWith(text: string, pattern: string): boolean;
    format(sentence: string, ...args: any[]): string;
    capitalizeTransform(text: string, camelCase: boolean, concatLiteral?: string): string;
    stringToDate(text: string): Date;
    timeToDate(text: string): Date;
    concatDateWithTime(dateValue: Date, timeValue: Date): Date;
    paddy(value: string, padCount: number, character?: string): string;
    compare(phrase: string, compareTo: string): boolean;
    cleanText(value: string): string;
    findElementPos(element: HTMLElement): number;
}
