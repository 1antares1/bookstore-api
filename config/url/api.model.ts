/**
 * Own
 */
//#region models
import { IConfigUrl } from "../url/url.model";
//#endregion

export interface IApi {
    baseUrl: string;
    key: string;
    id: string;
    name: string;
    version: string;
}
