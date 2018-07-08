import * as http from "http";
import * as httpParse from "querystring";
import * as httpRouter from "./node_modules/routes";
import * as path from "path";
import * as favicon from "serve-favicon";
import * as bodyParser from "body-parser";
import * as url from "url";
import * as _ from "lodash";
import { createReadStream } from "fs";
import { NextHandleFunction, NextFunction, SimpleHandleFunction } from "./node_modules/@types/connect";

/**
 * Own
 */
//#region routes
import { IRouteOptions, RenderType, BaseRoute } from "./routes";
//#endregion

//#region models
import { ServerSettings } from "./config/settings/settings";
//#endregion

export const ROOT_PATH: string = path.join(__dirname, "./");

// /**
//  * Creates and configures an ExpressJS web server.
//  *
//  * @class Server
//  */
export default class Server {
    private jsonParser: NextHandleFunction;
    private serverSettings: ServerSettings;

    //#region properties
    public httpService: http.Server;
    public router: httpRouter;
    //#endregion

    /**
     * Bootstrap the application.
     *
     * @class Server
     * @method bootstrap
     * @static
     * @return {ng.auto.IInjectorService} Returns the newly created injector for this app.
     */
    public static bootstrap(httpService: http.Server): Server {
        return new Server(httpService);
    }

    constructor(httpService: http.Server) {
        // create expressjs application
        this.httpService = httpService;
        this.router = httpRouter();

        // configure application
        this.serverSettings = new ServerSettings();
        this.config();
    }

    public api(httpService: http.Server, router: httpRouter) {
        // const bookRoutes = new BookRoutes(httpService, router);
    }

    private config() {
        const app = this.httpService;
        const collectRequestData = (req: http.IncomingMessage, callback: (data: httpParse.ParsedUrlQuery) => void) => {
            const FORM_URLENCODED = "application/x-www-form-urlencoded";
            if(req.headers["content-type"] === FORM_URLENCODED) {
                let body = "";
                req.on("data", chunk => {
                    body += chunk.toString();
                });
                req.on("end", () => {
                    callback(httpParse.parse(body));
                });
            }
            else {
                callback(null);
            }
        }
        const onRequest = (req: http.IncomingMessage, res: http.ServerResponse) => {
            const pathname: string = url.parse(req.url).pathname;
            const verb: string = req.method;
            const match = this.router.match(req.url);
            let dataResponse: any;

            if (verb === "OPTIONS") {
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
                res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                res.setHeader("Access-Control-Allow-Credentials", "true");
                res.writeHead(200);
                res.end();
                return;
            }
            if (verb === "GET" && pathname === "/favicon.ico") {
                res.setHeader("Content-Type", "image/x-icon");
                createReadStream(path.join(ROOT_PATH, this.serverSettings.faviconPath)).pipe(res);
                return;
            }

            if (match) {
                const nextFunction = (request: http.IncomingMessage, response: http.ServerResponse, params?: any) => {
                    match.fn(request, response, params);
                }
                if (verb === "POST") {
                    // returns middleware that parses all bodies as a string
                    bodyParser.urlencoded({
                        extended: false
                    });
                    this.jsonParser = bodyParser.json();

                    collectRequestData(req, result => {
                        nextFunction(req, res, match.params);
                    });
                } else {
                    nextFunction(req, res, match.params);
                }
            }
            else {
                if (res.statusCode === 500) {
                    dataResponse = {
                        error: {
                            status: req.statusCode,
                            message: req.statusMessage,
                            stack: (req as any).stack
                        }
                    };
                } else {
                    dataResponse = BaseRoute.getNotFoundErrorException(req);
                }
                res.writeHead(404, dataResponse)
                res.end();
            }
        };

        // config middleware
        this.middleware(onRequest);
    }

    private middleware(handleRequest: SimpleHandleFunction) {
        this.httpService = http.createServer(handleRequest);

        // configure api
        this.api(this.httpService, this.router);

        // add default routes
        this.defaultRoutes();
    }

    private defaultRoutes() {
        const app = this.httpService;
        const router = this.router;
        const routeSettings: IRouteOptions = {
            host: this.serverSettings.devHost,
            indexPath: path.join(ROOT_PATH, this.serverSettings.indexPath),
            downPath: path.join(ROOT_PATH, this.serverSettings.downPath),
            metaPath: path.join(ROOT_PATH, this.serverSettings.metaPath)
        };

        BaseRoute.create("/robots.txt", router, RenderType.data, routeSettings);
        BaseRoute.create("/downrightnow", router, RenderType.file, routeSettings);
        BaseRoute.create("/api", router, RenderType.data);
        BaseRoute.create("/api/v1/settings", router, RenderType.data);
    }
}
