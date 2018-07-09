import { OutgoingHttpHeaders } from "http";
import { Options } from "request-promise";

/**
 * Own
 */
//#region models
import { IAppSettings } from "./settings/app-settings";
//#endregion

export interface IConfigService {
    appSettings: IAppSettings;
    authDataId: string;
    rolesDataId: string;
    baseRoute: string;
    isInitialized: boolean;
    setRestConfig(options: Options): void;
    getRestConfig(): Options;
    mergeHttpHeaders(source: OutgoingHttpHeaders, target: OutgoingHttpHeaders): OutgoingHttpHeaders;
}
