import * as http from "http";
import * as httpRouter from "../node_modules/routes";
import * as url from "url";
import { readFile } from "fs";
import { info, log } from "console";
import { clone } from "lodash/fp";
import { NextFunction } from "../node_modules/@types/connect";

/**
 * Own
 */
//#region enums
import { RenderType } from "./render-type.enum";
import { HttpMethod } from "../shared/models/http-method.enum";
//#endregion

//#region models
import { IAppSettings } from "../config/settings/app-settings";
import { FILE_EXTENSION_REGEX } from "../shared/regexps/file-extension.regex";
import { IRouteOptions } from "./route-options";

//#endregion

export class BaseRoute {
    private static _appSettings: IAppSettings;
    public static FILE_EXTENSION_REGEX: RegExp = FILE_EXTENSION_REGEX;
    public static CUSTOM_PATHS: string[] = ["/content/", "/js/"];

    //#region properties
    public apiURL = "/api";
    public apiVersion = "/v1";
    public baseUrl = `${this.apiURL}${this.apiVersion}`;
    public get appSettings(): IAppSettings {
        return BaseRoute._appSettings || (BaseRoute._appSettings = BaseRoute.getDefaultAppSettings());
    }
    //#endregion

    /**
     * Create the routes.
     * @class IndexRoute
     * @method create
     * @static
     */
    public static create(path: string|string[], router: httpRouter, type: RenderType, options?: IRouteOptions) {
        const target: string = (path === "/") ? " index " : " ";
        const nextCallback = (req: http.IncomingMessage, res: http.ServerResponse, data?: any): void => {
            new BaseRoute().index(req, res, type, options, data);
        };

        router.addRoute(path, (req: http.IncomingMessage, res: http.ServerResponse, next: NextFunction) => {
            switch (path) {
                case "/robots.txt":
                     readFile(this.getFullUrl(req, `${options.metaPath}\\${req.url.split("/").reverse()[0]}`).href, (err: NodeJS.ErrnoException, data: Buffer) => {
                        nextCallback(req, res, data.toString("utf8") || JSON.stringify(err));
                    });
                    break;

                case "/api/v1/settings":
                    nextCallback(req, res, BaseRoute.initSettings(req, res));
                    break;
                default:
                    nextCallback(req, res);
                    break;
            }
        });
        log(`[IndexRoute::create] Creating${target}route: "${path}")`);
    }

    public static getFullUrl(request: http.IncomingMessage, pathName?: string): url.URL {
        let fullUrl: url.URL;
        if (request && request.url) {
            fullUrl = new url.URL((pathName || request.url), request.headers.host.toString().concat("://", request.url));
        }
        return fullUrl;
    }

    public static getNotFoundErrorException(req: http.IncomingMessage) {
        return new Error(`Not found: /${req.method.toString()} ${req.url}.`);
    }

    public static getDefaultAppSettings(req?: http.IncomingMessage, res?: http.ServerResponse): IAppSettings {
        const _env = "dev";
        const _domains: string[] = [
            "api.gbh.com.do"
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
                externalIdentity: process.env.externalIdentity_Url
                    ? _fullUrl(process.env.profile_Url)
                    : _getProtocol(true, true).concat(_domains[0]),
                profile: process.env.profile_Url
                    ? _fullUrl(process.env.profile_Url)
                    : _getProtocol(true, true).concat(_domains[0]),
                translation: process.env.Translation_Url
                    ? _fullUrl(process.env.profile_Url)
                    : _getProtocol(true, true).concat(_domains[0])
            }
        };
        return appSettings;
    }

    private static initSettings(req: http.IncomingMessage, res: http.ServerResponse): IAppSettings {
        return clone((this._appSettings = this.getDefaultAppSettings(req, res)));
    }

    constructor() {
        //
    }

    public setUpRoute(path: string, method: HttpMethod, application: http.Server, router: httpRouter, handler: any, name?: string, parseXml?: boolean) {
        const target: string = (path === "/") ? " index " : " ";
        info(`[${name || "*Unknown-route"}::create] Creating${target}route: "${path}"`);

        switch (method) {
            case HttpMethod.GET: //
                // (parseXml) ? router.get(path, xmlparser({ trim: false, explicitArray: false }), handler) : router.get(path, handler);
                router.addRoute(path, handler);
                break;

            case HttpMethod.POST:
                router.addRoute(path, handler);
                break;

            case HttpMethod.PUT: //
                break;

            default: //
                break;
        }
        // application.use(router);
    }
    /**
     * Render a page.
     *
     * @class BaseRoute
     * @method render
     * @param req {Request} The request object.
     * @param res {Response} The response object.
     * @param view {String} The type to response.
     * @param routeOptions {Object} Additional options to append to the view"s local scope.
     * @return void
     */
    public render(req: http.IncomingMessage, res: http.ServerResponse, type: RenderType, routeOptions: IRouteOptions, data?: any) {
        const sendHeaderResponse = (message: string, statusCode?: number, contentType?: string) => {
            res.writeHead(statusCode || 500, message, { "Content-Type" : contentType || "text/plain" });
        };

        try {
            switch (type) {
                case RenderType.data:
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json; charset=utf-8");
                    res.write((typeof data !== "string") ? JSON.stringify(data) : data);
                    break;

                case RenderType.file:
                    if ((req.url as string).match(BaseRoute.FILE_EXTENSION_REGEX) && !BaseRoute.CUSTOM_PATHS.some((val) => req.url.startsWith(val))) {
                        res.statusCode = 404;
                        sendHeaderResponse(BaseRoute.getNotFoundErrorException(req).message, res.statusCode);
                    } else {
                        res.writeHead(302, {
                            "Location": url.resolve(routeOptions.host, req.url)
                        });
                    }
                    break;
            }
        } catch(ex) {
            sendHeaderResponse((ex as string).toString());
        } finally {
            res.end();
        }
    }

    /**
     * The home page route.
     *
     * @class IndexRoute
     * @method index
     * @param req {Request} The express Request object.
     * @param res {Response} The express Response object.
     * @param routeOptions {Object} Additional options to append to the view"s local scope.
     * @next {NextFunction} Execute the next method.
     */
    public index(req: http.IncomingMessage, res: http.ServerResponse, type: RenderType, options: IRouteOptions, data?: any) {
        this.render(req, res, type, options, data);
    }
}
