import * as http from "http";
import * as httpRouter from "node_modules/routes";
import * as jsdom from "jsdom";
import * as jquery from "jquery";
import * as url from "url";

/**
 * Own
 */
//#region models
import { IBooksService } from "../repositories/books";
//#endregion

//#region modules
import { BaseRoute } from "./base";
//#endregion

//#region shared
import { HttpMethod, Format } from "../shared/enums";
import { EventLog } from "../shared/helpers/telemetry/event-log";
import { URL_REGEX } from "../shared/helpers/regexps/url.regex";
//#endregion

let $self: BookRoutes;

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
        $self = this;
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
    getBooksHandler(req: http.IncomingMessage, res: http.ServerResponse): void {
        const httpHeaders: http.OutgoingHttpHeaders = { "Content-Type" : "text/html" };
        const resource = $self.booksService.getBooks()(HttpMethod.GET).then((value: any) => {
            super.endHandler(res, true, res.statusCode, value, httpHeaders);
        }).catch((err: any) => {
            super.endHandler(res, true, 404, err.error || err.message || err, httpHeaders);
        });
    }

    getBookByIdHandler(req: http.IncomingMessage, res: http.ServerResponse): void {
        const httpHeaders: http.OutgoingHttpHeaders = { "Content-Type" : "text/html" };
        const resource = $self.booksService.getBookDetails("51783")(HttpMethod.GET).then((value: any) => {
            super.endHandler(res, true, res.statusCode, value, httpHeaders);
        }).catch((err: any) => {
            super.endHandler(res, true, 404, err.error || err.message || err, httpHeaders);
        });
    }

    getFileHandler(req: http.IncomingMessage, res: http.ServerResponse): void {
        const httpHeaders: http.OutgoingHttpHeaders = { "Content-Type" : "text/html" };
        const urlNodes: string[] = req.url.split("/");
        const queryParams = {
            isbn: urlNodes[2],
            page: urlNodes[4],
            format: Format[Object.keys(Format).filter((key: string) => {
                    return key.toLowerCase().indexOf(urlNodes[5].toLowerCase()) !== -1;
                })[0]] || Format.HTML
        }
        const callbackError = (err: any, defaultHeaders: boolean = true) => {
            super.endHandler(res, true, 404, err.error || err.message || err, (defaultHeaders) ? httpHeaders : null);
        }
        const bookDetailsResource = $self.booksService.getBookDetails(queryParams.isbn)(HttpMethod.GET).then((bookDetails: any) => {
            try {
                const $: JQueryStatic = (jquery(new jsdom.JSDOM("").window) as any as JQueryStatic);
                const availableLinks = $(bookDetails).find("table.files").find("tr[about] td[property] a");
                let selectedFile: JQuery<any>;
                let uriFile: string;

                if (availableLinks && availableLinks.length) {
                    selectedFile = availableLinks.filter((idx: number, selector: HTMLTableRowElement) => {
                        return $(selector).attr("type").split(";")[0].indexOf(queryParams.format) !== -1;
                    });
                    if (selectedFile && selectedFile[0] && (selectedFile[0] as HTMLAnchorElement).href) {
                        uriFile = (selectedFile[0] as HTMLAnchorElement).href.match(URL_REGEX)[0];
                        uriFile = new url.URL("".concat("http:", uriFile)).pathname;
                        const resource = $self.booksService.getBookFile(queryParams.isbn, uriFile)(HttpMethod.GET).then((content: any) => {
                            super.endHandler(res, true, res.statusCode, $self.fetchBookContent(parseInt(queryParams.page), queryParams.format, content), httpHeaders);
                        }).catch((err: any) => {
                            callbackError(err);
                        });
                        return resource;
                    } else {
                        callbackError({ "errorCode": -1001, "errorMessage": `Format: ${queryParams.format} is not available at this time. Try another one. E.g .: "html" or "plain text".'` }, false);
                    }
                } else {
                    callbackError({ "errorCode": -1002, "errorMessage": "Sorry! This book is not available for download. :( But we still have more interesting for you!" }, false);
                }
            } catch (err) {
                callbackError(err);
            }
        }).catch((err: any) => {
            callbackError(err);
        });
    }

    private fetchBookContent(offset: number, format: Format, content: string): string {
        const fromBase: number = (format !== Format.Plain) ? 2665 : 0;
        const countPerPage: number = 4500;

        if (content && content.length && offset) {
            content = content.substr(fromBase + (countPerPage * (offset - 1)), countPerPage);
        }
        return content;
    }
    //#endregion
}
