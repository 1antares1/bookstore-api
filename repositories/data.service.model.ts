import { OutgoingHttpHeaders } from "http";
import { Options } from "request-promise";

/**
 * Own
 */
//#region models
import { IDataService } from "./data.service.model";
import { ICredentials } from "../config/authentication/credentials/credentials.model";
import {  ITuple } from "../shared/index";
import { RequestHeader } from "../config/settings";
//#endregion

export interface IDataService {
    baseUrl(): string;
    createCredentials(absolutePath: string): ICredentials;
    applyIdentity(identity: any): void;
    applyCredentials(credentials: ICredentials): void;
    composeUrl(urlFragment: string, fromOrigin?: boolean, fullUrl?: boolean): string;
    prepareAuthenticatedOption<T>(currentRequestOptions: Options): Options;
    prepareAnonymousOptions(currentRequestOptions: Options): Options;
    prepareREST<T>(url: string, anotherDomain: boolean, queryString?: object): Options;
    signAnonymousRequest(url: string): ICredentials;
    signAuthenticatedRequest(url: string): void;
    getUrlFragment(urlFragment: string): string;
    getAuthenticatedResource<T>(route: string, anotherDomain: boolean, fromOrigin?: boolean, headers?: Array<ITuple<RequestHeader>>, queryString?: object): Options;
    getAnonymousResource<T>(route: string, anotherDomain: boolean, fromOrigin?: boolean, headers?: Array<ITuple<RequestHeader>>, queryString?: object): Options;
}
