import * as http from "http";
import { Promise } from "bluebird";
import { RequestPromise, Options, get, post, put, patch, del, head, OptionsWithUri } from "request-promise";
import { clone } from "lodash/fp";

/**
 * Own
 */
//#region enums
import { HttpMethod } from "../../shared/enums/http-method.enum";
//#endregion

//#region models
import { IHttpResource } from "../http/http-resource.model";
//#endregion

export function RequestMethod<T>(reqOptions: Options): IHttpResource<T> {
    return (method: HttpMethod, body?: any|object): RequestPromise => {
        const rawRequest: Options = clone(reqOptions);
        rawRequest.method = HttpMethod[method].toString(),
        rawRequest.body = body;

        const customRequest: OptionsWithUri = clone(reqOptions as OptionsWithUri);
        const url: string = customRequest.uri.toString();
        customRequest.method = HttpMethod[method].toString();
        customRequest.body = body;
        customRequest.json = true;

        switch (method) {
            case HttpMethod.POST:
                return post(url, customRequest);
            case HttpMethod.PUT:
                return put(url, customRequest.body);
            case HttpMethod.PATCH:
                return patch(url, customRequest.body);
            case HttpMethod.DELETE:
                return del(url, customRequest);
            case HttpMethod.OPTIONS:
                return head(url, customRequest);
            case HttpMethod.REQUEST:
            case HttpMethod.GET:
            default:
                return get(url, customRequest);
        }
    };
}
