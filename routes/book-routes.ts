import * as http from "http";
import * as httpRouter from "node_modules/routes";
import * as url from "url";
import { SimpleHandleFunction } from "../node_modules/@types/connect";

/**
 * Own
 */
//#region modules
import { BaseRoute } from "./base";
//#endregion

//#region shared
import { HttpMethod } from "../shared/enums/http-method.enum";
import { EventLog } from "../shared/helpers/telemetry/event-log";
//#endregion

//#region models
import { IBooksService } from "repositories/books";
//#endregion

export class BookRoutes extends BaseRoute {
    //#region properties
    public application: http.Server;
    public httpRouter: httpRouter;
    public eventLog: EventLog;
    //#endregion

    constructor(public server: http.Server, public router: httpRouter, public booksService: IBooksService) {
        super();
        this.application = server;
        this.httpRouter = router;
        this.eventLog = new EventLog();
        this.init();
    }

    //#region init
    init(): void {
        this.api(this.router);
    }
    //#endregion init

    //#region resources
    api(router: httpRouter): void {
        const schemeName = "Book-routes";
        this.setUpRoute(`/books`, HttpMethod.GET, this.application, this.router, this.getBooksHandler, schemeName);
        this.setUpRoute(`/books/:id`, HttpMethod.GET, this.application, this.router, this.getBookByIdHandler, schemeName);
        this.setUpRoute(`/files/:id/page/:page/:format?`, HttpMethod.GET, this.application, this.router, this.getFileHandler, schemeName);
    }
    //#endregion

    //#region logic
    private getBooksHandler(req: http.IncomingMessage, res: http.ServerResponse): void {
        super.endHandler(res, true, res.statusCode, { "key": "test" });
    }

    private getBookByIdHandler(req: http.IncomingMessage, res: http.ServerResponse): void {
        super.endHandler(res, true, res.statusCode, { "key": "test" });
    }

    private getFileHandler(req: http.IncomingMessage, res: http.ServerResponse): void {
        super.endHandler(res, true, res.statusCode, { "key": "test" });
    }
    //#endregion
}
