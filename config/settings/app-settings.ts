/**
 * Own
 */
//#region models;
import { IAppManagement, IAppConfig } from "../management/management.model";
import { IConfigUrl } from "../url/url.model";
import { IApi } from "../api/api.model";
//#endregion

export interface IAppSettings {
    appConfig: IAppConfig;
    api: IApi;
    appId: string;
    "Telemetry.AI.InstrumentationKey": string;
    urls: IConfigUrl;
    management: IAppManagement;
}
