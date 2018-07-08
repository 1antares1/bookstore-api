import { Observable } from "rxjs";

//#region models
import { HttpMethod } from "../../shared/models/http-method.enum";
//#endregion

export type IHttpResource<T> = (method: HttpMethod, body?: any|object) => Observable<any>;
