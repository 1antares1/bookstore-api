import { Options } from "request-promise";
import * as url from "url";

/**
 * Own
 */
//#region enums
import { RequestHeader } from "../config/settings/header.enum";
//#endregion

//#region models
import { IDataService } from "./data.service.model";
import { ICredentials } from "../config/authentication/credentials/credentials.model";
import { Credentials } from "../config/authentication/credentials/credentials";
import { HttpMethod, ITuple, UtilService } from "../shared/index";
//#endregion

//#region services
import { IConfigService, ConfigService } from "../config";
import { IUtilService } from "../shared/helpers/utilities/util.service.model";
//#endregion

export class DataService implements IDataService {
    private _configService: IConfigService;
    private _utilService: IUtilService;

    //#region properties
    private apiKey: string;
    private apikeyId: string;
    private urlKeys: string[];
    private optionalHeaders: Array<ITuple<RequestHeader>>;
    private contextService: string;

    public setConfigService(configService: IConfigService): void {
        this._configService = configService;
    }

    public getConfigService(): IConfigService {
        return (!this._configService) ? new ConfigService() : this._configService;
    }

    public setUtilService(utilService: IUtilService): void {
        this._utilService = utilService;
    }

    public getUtilService(): IUtilService {
        return (!this._utilService) ? new UtilService() : this._utilService;
    }
    //#endregion

    constructor(serviceName: string) {
        this.contextService = serviceName;
        this.init();
    }

    public init(): void {
        const config: IConfigService = this.getConfigService();
        if(config.isInitialized) {
            this.apiKey = config.appSettings.api.key;
            this.apikeyId = config.appSettings.api.id;
            this.urlKeys = Object.keys(config.appSettings.urls);
        }
    }

    public baseUrl(): string {
        const splitInstancePattern: RegExp = /(?=[A-Z])/;
        let instanceName: string = this.contextService;
        if (instanceName && instanceName !== "Unknown") {
            instanceName = instanceName.split(splitInstancePattern)[0].toLowerCase();
            let urlIdx = -1;
            this.urlKeys.some((val: string, idx: number, arr: string[]) => {
                if (val.split(splitInstancePattern)[0].toLowerCase() === instanceName) {
                    urlIdx = idx;
                    return true;
                }
            });
            if (urlIdx !== -1) {
                return this.getConfigService().appSettings.urls[this.urlKeys[urlIdx]];
            }
        }
        return this.getConfigService().appSettings.urls["N/A"];
    }

    public createCredentials(absolutePath: string): ICredentials {
        return (this.getConfigService().appSettings) ? new Credentials(this.apikeyId, this.apiKey, absolutePath) : null;
    }

    public applyCredentials(credentials: ICredentials): void {
        if (credentials) {
            let requestOptions: Options = {
                method: HttpMethod[HttpMethod.OPTIONS],
                baseUrl: this.getConfigService().baseUrl,
                uri: this.getConfigService().baseUrl,
                headers:
                {
                    [Object.keys(RequestHeader)[0]]: `${RequestHeader.Anonymous} ${credentials.token}`,
                    [RequestHeader.Date]: credentials.dateTimeHeaderValue
                }
            };
            requestOptions = this.prepareAnonymousOptions(requestOptions);
            this.getConfigService().setRestConfig(requestOptions);
        }
    }

    public applyIdentity(identity: any): void {
        if (identity) {
            let requestOptions: Options = {
                method: HttpMethod[HttpMethod.OPTIONS],
                baseUrl: this.getConfigService().baseUrl,
                uri: this.getConfigService().baseUrl,
                headers: {
                    [Object.keys(RequestHeader)[0]]: `${RequestHeader.Authorization} ${identity.authenticationToken}`
                }
            };
            requestOptions = this.prepareAuthenticatedOption<any>(requestOptions);
            this.getConfigService().setRestConfig(requestOptions);
        }
    }

    public composeUrl(urlFragment: string, fromOrigin?: boolean, fullUrl?: boolean): string {
        const composedUrl: string = (fromOrigin ? "" : this.getConfigService().baseUrl) + urlFragment;
        return (fullUrl) ? this.baseUrl().concat(composedUrl) : composedUrl;
    }

    public prepareAnonymousOptions(currentRequestOptions: Options): Options {
        const newRequestOptions: Options = currentRequestOptions;

        if (this.optionalHeaders && this.optionalHeaders.length) {
            this.optionalHeaders.forEach((val: ITuple<RequestHeader>, idx: number, arr: Array<ITuple<RequestHeader>>) => {
                newRequestOptions.headers[val.value] = val.text;
            });
        }
        this.optionalHeaders = null;
        return newRequestOptions;
    }

    public prepareAuthenticatedOption<T>(currentRequestOptions: Options): Options {
        return currentRequestOptions;
    }

    public prepareREST<T>(urlString: string, anotherDomain: boolean, queryString?: object): Options {
        const location: URL = new url.URL((anotherDomain) ? urlString : this.getConfigService().getRestConfig().baseUrl);
        const config: Options = {
            method: HttpMethod[HttpMethod.OPTIONS],
            uri: location.href || location.pathname,
            headers: (this.getConfigService().getRestConfig() && this.getConfigService().getRestConfig().headers) ? this.getConfigService().getRestConfig().headers : { },
        };
        this.getConfigService().setRestConfig(config);
        return {
            method: HttpMethod[HttpMethod.GET],
            uri: config.uri,
            headers: config.headers,
            qs: queryString
        } as Options;
    }

    public signAnonymousRequest(urlString: string): ICredentials {
        const credentials = this.createCredentials(urlString);
        this.applyCredentials(credentials);
        return credentials;
    }


    public signAuthenticatedRequest(urlString: string): void {
        const identity: any = null;
        if (identity) {
            this.applyIdentity(identity);
        } else {
            this.applyIdentity(null);
        }
    }

    public getUrlFragment(urlFragment: string): string {
        if (urlFragment.indexOf("/") === -1) {
            urlFragment = this.getConfigService().appSettings.urls.fragments[urlFragment];
        }
        return urlFragment;
    }

    public getAuthenticatedResource<T>(route: string, anotherDomain: boolean = true, fromOrigin?: boolean, headers?: Array<ITuple<RequestHeader>>, queryString?: object): Options {
        const url: string = this.getUrlFragment(route);
        this.optionalHeaders = headers;
        this.signAuthenticatedRequest(this.composeUrl(url));
        return this.prepareREST<T>(this.composeUrl(url, fromOrigin, true), anotherDomain, queryString);
    }

    public getAnonymousResource<T>(route: string, anotherDomain: boolean = true, fromOrigin?: boolean, headers?: Array<ITuple<RequestHeader>>, queryString?: object): Options {
        const url: string = this.getUrlFragment(route);
        this.optionalHeaders = headers;
        this.signAnonymousRequest(this.composeUrl(url));
        return this.prepareREST<T>(this.composeUrl(url, fromOrigin, true), anotherDomain, queryString);
    }
}
