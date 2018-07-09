import * as url from "url";
import { OutgoingHttpHeaders, IncomingMessage, ServerResponse } from "http";
import { Options } from "request-promise";
import { clone, each } from "lodash/fp";

/**
 * Own
 */
//#region models
import { IAppSettings } from "./settings/app-settings";
import { IConfigService } from "./config.service.model";
//#endregion

export class ConfigService implements IConfigService {
    private static _appSettings: IAppSettings;
    private static _restConfig: Options;

    //#region properties
    public authDataId: string;
    public rolesDataId: string;
    public baseRoute: string;
    public isInitialized: boolean;
    public baseUrl: string;
    public get appSettings(): IAppSettings {
        return ConfigService._appSettings || (ConfigService._appSettings = ConfigService.getDefaultAppSettings());
    }

    get REST_CONFIG(): Options {
        return ConfigService._restConfig;
    }
    set REST_CONFIG(value: Options) {
        if (!value) {
            throw new Error("Default 'RequestOptionsArgs' can not be null");
        }
        ConfigService._restConfig = value;
    }
    //#endregion

    constructor() {
        this.init();
    }

    public init(): void {
        this.baseUrl = `${this.appSettings.api.baseUrl}${this.appSettings.api.version}`;
    }

    public setRestConfig(options: Options): void {
        this.REST_CONFIG = options;
    }

    public getRestConfig(): Options {
        return this.REST_CONFIG;
    }

    public mergeHttpHeaders(source: OutgoingHttpHeaders, target: OutgoingHttpHeaders): OutgoingHttpHeaders {
        const newHttpHeaders: OutgoingHttpHeaders = { };
        if (target.keys && target.length) {
            each(target as any, (keyHeader: string) => {
                newHttpHeaders[keyHeader] = target[keyHeader];
            });
        }
        return newHttpHeaders;
    }

    public static getDefaultAppSettings(req?: IncomingMessage, res?: ServerResponse): IAppSettings {
        const _env = "dev";
        const _domains: string[] = [
            "api.gbh.com.do",
            "www.gutenberg.org"
        ];
        const _getProtocol = (full?: boolean, secure?: boolean): string => {
            // get protocol using http.IncomingMessage - missing
            let _protocol = ((secure) ? "https" : ((req && req.connection as any).encrypted) ? "https:" : ((req) ? req.headers["x-forwarded-proto"] as string || req.url : "http:"));
            _protocol = _protocol.split(/\s*,\s*/)[0];
            return (full) ? _protocol.concat("://") : _protocol;
        };
        const _fullUrl = (hostname: string): string => {
            return url.format({
                protocol: _getProtocol(),
                host: hostname
            });
        };
        const appSettings: IAppSettings = {
            api: {
                baseUrl: _domains[0],
                key: process.env.apiKey ? process.env.apiKey : "cjA2aTJValJKVVpZdm1YU281QXkrcFhoVHNMUkF0Q3RMSzlHM0FDMEh5dzJHVnBsQzhKRXNSbFRsVCttWDJUSklXT2piQlRUbno3ditTSmhhL0w0NWIxNndJR1M3Um9aZVFBSkNMbXdHSFU9",
                id: process.env.apiId ? process.env.apiId : "F139F723-1EA8-469D-B1C1-76EA62FEA599",
                name: "api",
                version: "v1"
            },
            appConfig: {
                management: {
                    maintenance: {
                        scheduled: ((process.env.Maintenance_Scheduled && process.env.Maintenance_Scheduled !== "" && String(process.env.Maintenance_Scheduled) !== "false") || false),
                        data: {
                            title: process.env.Maintenance_Data_Title || "Date:",
                            message: process.env.Maintenance_Data_Message || "We are working very hard on the new version of our site. It will bring a lot of new features.",
                            datetime: new Date(process.env.Maintenance_Data_Datetime) || new Date()
                        }
                    }
                },
                supportEmail: process.env.supportEmail ? process.env.supportEmail : "info@gbh.com.do"
            },
            appId: "37FA1B99-6B14-4C52-823A-020C01FF2E53",
            "Telemetry.AI.InstrumentationKey": process.env["Telemetry.AI.InstrumentationKey"] ? process.env["Telemetry.AI.InstrumentationKey"] : "4fc1db62-df05-49ce-864a-b62d1c377e04",
            management: {
                maintenance: null
            },
            urls: {
                fragments: { },
                identity: process.env.identity_Url
                    ? _fullUrl(process.env.profile_Url)
                    : _getProtocol(true, true).concat(_domains[0]),
                profile: process.env.externalIdentity_Url
                    ? _fullUrl(process.env.profile_Url)
                    : _getProtocol(true, true).concat(_domains[0]),
                categories: process.env.profile_Url
                    ? _fullUrl(process.env.profile_Url)
                    : _getProtocol(true, true).concat(_domains[1]),
                books: process.env.profile_Url
                    ? _fullUrl(process.env.profile_Url)
                    : _getProtocol(true, true).concat(_domains[1]),
                files: process.env.Translation_Url
                    ? _fullUrl(process.env.profile_Url)
                    : _getProtocol(true, true).concat(_domains[1]),
                translation: process.env.Translation_Url
                    ? _fullUrl(process.env.profile_Url)
                    : _getProtocol(true, true).concat(_domains[0])
            }
        };
        return appSettings;
    }
}
