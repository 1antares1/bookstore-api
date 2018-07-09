import { Promise } from "bluebird";
import { RequestPromise } from "request-promise";

//#region models
import { HttpMethod } from "../../shared/enums/http-method.enum";
//#endregion

export type IHttpResource<T> = (method: HttpMethod, body?: any|object) => RequestPromise;
