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
import { HttpMethod } from "../shared/enums/http-method.enum";
//#endregion

//#region models
import { IAppSettings } from "../config/settings/app-settings";
import { FILE_EXTENSION_REGEX } from "../shared/helpers/regexps/file-extension.regex";
import { IRouteOptions } from "./route-options";
//#endregion

//#region services
import { IConfigService, ConfigService } from "../config";
//#endregion

export class BaseRoute {
    private _configService: IConfigService;
    public static FILE_EXTENSION_REGEX: RegExp = FILE_EXTENSION_REGEX;
    public static CUSTOM_PATHS: string[] = ["/content/", "/js/"];

    //#region properties
    public get configService(): IConfigService {
        return this._configService || (this._configService = new ConfigService());
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

    private static initSettings(req: http.IncomingMessage, res: http.ServerResponse): IAppSettings {
        return clone((ConfigService.getDefaultAppSettings(req, res)));
    }

    constructor() {
        //
    }

    public setUpRoute(path: string, method: HttpMethod, application: http.Server, router: httpRouter, handler: any, name?: string, parseXml?: boolean) {
        const target: string = (path === "/") ? " index " : " ";
        info(`[${name || "*Unknown-route"}::create] Creating${target}route: "${path}"`);

        switch (method) {
            case HttpMethod.GET:
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
        try {
            res.statusCode = 200;

            switch (type) {
                case RenderType.data:
                    this.endHandler(res, true, res.statusCode, null, { "Content-Type": "application/json; charset=utf-8" });
                    break;

                case RenderType.file:
                    if ((req.url as string).match(BaseRoute.FILE_EXTENSION_REGEX) && !BaseRoute.CUSTOM_PATHS.some((val) => req.url.startsWith(val))) {
                        res.statusCode = 404;
                        this.writeHeadResponse(res, BaseRoute.getNotFoundErrorException(req).message, res.statusCode);
                    } else {
                        res.writeHead(302, {
                            "Location": url.resolve(routeOptions.host, req.url)
                        });
                    }
                    break;
            }
        } catch(ex) {
            this.writeHeadResponse(res, (ex as string).toString());
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

    public writeHeadResponse(res: http.ServerResponse, message: string, statusCode?: number, contentType?: string) {
        res.writeHead(statusCode || 500, message, { "Content-Type" : contentType || "text/plain" });
    }

    public endHandler (res: http.ServerResponse, success: boolean, statusCode: number, response?: any, outHeaders?: http.OutgoingHttpHeaders): void {
        res.statusCode = statusCode;
        (outHeaders && Object.keys(outHeaders).length) ?
            Object.keys(outHeaders).forEach((key: string) => {
                res.setHeader(key, outHeaders[key]);
            }) : res.setHeader("Content-Type", "application/json; charset=utf-8");

        if (!success) {
            (this && this.writeHeadResponse) ? this.writeHeadResponse(res, null, statusCode) : res.writeHead(statusCode, null, { "Content-Type" : "text/plain" })
        }
        res.end((typeof response !== "string") ? ((typeof response === "object") ? JSON.stringify(response) : response.toString()) : response);
    }

    public getParsedUrl(urlString: string): url.UrlWithParsedQuery {
        return (urlString && urlString !== "") ? url.parse(urlString, true) : null;
    }
}
