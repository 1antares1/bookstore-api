import * as http from "http";
import * as Promise from "bluebird";
import * as request from "request";
import * as url from "url";

/**
 * Own
 */
//#region routes
import { BaseRoute } from "../../../routes/base";
//#endregion

//#region enums
import { StatusMessage } from "../../enums/status-message.enum";
import { HttpMethod } from "../../enums/http-method.enum";
//#endregion

//#region models
import { IAppSettings } from "config/settings/app-settings";
import { IEventLog } from "../../models/log.model";
import { IHttpInMessage } from "../../models/http-incoming.model";
//#endregion

export class EventLog {
    public putLogServer(req: http.IncomingMessage, eventLog: IEventLog): Promise<any> {
        const eventLogPromise:  Promise<IHttpInMessage> = new Promise((
            resolve: (value?: IHttpInMessage) => void,
            reject: (reason: IHttpInMessage) => void) => {
                request.get(BaseRoute.getFullUrl(req, "/api/v1/settings").toString(), (err: any, res: request.Response) => {
                    if (res && res.statusCode >= 200 && res.statusCode <= 204 && typeof res.toJSON() === "object") {
                        const appSettings = JSON.parse(res.body) as IAppSettings;
                        const urlTranslation = url.resolve(appSettings.urls.translation, "/api/v1/eventlog");
                        const serializedBody = JSON.stringify(eventLog);
                        const eventOptions = {
                            url: urlTranslation,
                            headers: {
                                "Content-Type": "application/json",
                                "Content-Length": Buffer.byteLength(serializedBody)
                            },
                            qs: {
                                api_key: appSettings.api.key
                            },
                            body: serializedBody,
                            method: HttpMethod[HttpMethod.POST]
                        };

                        request(eventOptions, (logErr: any, resLog: request.Response) => {
                            if (resLog.statusCode >= 200 && resLog.statusCode <= 204) {
                                resolve({
                                    properties: {
                                        code: resLog.statusCode,
                                        status: StatusMessage.Success.toString(),
                                        message: "Event log was successful."
                                    }
                                } as IHttpInMessage);
                            } else {
                                reject({
                                    properties: {
                                        code: resLog.statusCode,
                                        status: StatusMessage.Fail.toString(),
                                        message: "An error has occurred trying to register the log event."
                                    }
                                } as IHttpInMessage);
                            }
                        });
                    } else {
                        reject({
                            properties: {
                                code: res.statusCode,
                                status: StatusMessage.Error.toString(),
                                message: "Error getting initial settings of the application."
                            }
                        } as IHttpInMessage);
                    }
            });
        });

        return eventLogPromise;
    }
}
