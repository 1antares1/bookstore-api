/**
 * Own
 */
//#region models
import { ListPrice } from "./list-price.model";
import { RetailPrice } from "./retail-price.model";
//#endregion

export interface SaleInfo {
    country?: string;
    saleability?: string;
    onSaleDate?: string;
    isEbook?: boolean;
    listPrice?: ListPrice;
    retailPrice: RetailPrice;
    buyLink?: string;
}
