import * as http from "http";
import { Promise } from "bluebird";
import { RequestPromise, Options, get, post, put, patch, del, head } from "request-promise";
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

        const customRequest: Options = clone(reqOptions);
        customRequest.method = HttpMethod[method].toString();
        customRequest.body = body;
        customRequest.json = true;

        switch (method) {
            case HttpMethod.POST:
                return post(customRequest.baseUrl, customRequest);
            case HttpMethod.PUT:
                return put(customRequest.baseUrl, customRequest.body);
            case HttpMethod.PATCH:
                return patch(customRequest.baseUrl, customRequest.body);
            case HttpMethod.DELETE:
                return del(customRequest.baseUrl, customRequest);
            case HttpMethod.OPTIONS:
                return head(customRequest.baseUrl, customRequest);
            case HttpMethod.REQUEST:
            case HttpMethod.GET:
            default:
                return get(customRequest.baseUrl, customRequest);
        }
    };
}
