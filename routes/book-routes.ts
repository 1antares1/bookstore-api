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
import { BookDetails } from "../repositories/books/book-details.model";
import { ViewabilityState } from "../repositories/books/book-viewability.enum";
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
        this.setUpRoute(`/books/:id`, HttpMethod.GET, this.application, this.router, this.getBookByIdHandler, schemeName);
        this.setUpRoute(`/books/search/:query`, HttpMethod.GET, this.application, this.router, this.getBooksHandler, schemeName);
        this.setUpRoute(`/files/:id/page/:page/:format?`, HttpMethod.GET, this.application, this.router, this.getFileHandler, schemeName);
    }
    //#endregion

    //#region logic
    getBooksHandler(req: http.IncomingMessage, res: http.ServerResponse): void {
        const httpHeaders: http.OutgoingHttpHeaders = { "Content-Type" : "text/html" };
        const urlNodes: string[] = req.url.split("/");
        const queryParams = {
            query: urlNodes[3]
        }
        const callbackError = (err: any, defaultHeaders: boolean = true) => {
            super.endHandler(res, true, 404, err.error || err.message || err, (defaultHeaders) ? httpHeaders : null);
        }
        const resource = $self.booksService.getBooks(queryParams.query)(HttpMethod.GET).then((bookDetails: any) => {
            try {
                const $: JQueryStatic = (jquery(new jsdom.JSDOM("").window) as any as JQueryStatic);
                const results = $(bookDetails).find("ul.results li.booklink");
                let models: BookDetails[];
                if (results && results.length) {
                    models = [];
                    results.each((idx: number, selector: any) => {
                        models.push($self.prepareBookdInfo(selector, true));
                    });
                    super.endHandler(res, true, res.statusCode, models, null);
                } else {
                    callbackError({ "errorCode": -1003, "errorMessage": `No books with this term: '${queryParams.query}'. Try different.` }, false);
                }
            } catch(err) {
                callbackError(err);
            }
        }).catch((err: any) => {
            callbackError(err);
        });
    }

    getBookByIdHandler(req: http.IncomingMessage, res: http.ServerResponse): void {
        const httpHeaders: http.OutgoingHttpHeaders = { "Content-Type" : "text/html" };
        const urlNodes: string[] = req.url.split("/");
        const queryParams = {
            id: urlNodes[2]
        }
        const callbackError = (err: any, defaultHeaders: boolean = true) => {
            super.endHandler(res, true, 404, err.error || err.message || err, (defaultHeaders) ? httpHeaders : null);
        }
        const resource = $self.booksService.getBookDetails(queryParams.id)(HttpMethod.GET).then((bookDetails: any) => {
            try {
                const $: JQueryStatic = (jquery(new jsdom.JSDOM("").window) as any as JQueryStatic);
                const resultBody = $(bookDetails).find("div.body");
                let model: BookDetails;
                if (resultBody && resultBody.length) {
                    model = $self.prepareBookdInfo(resultBody, false)
                    super.endHandler(res, true, res.statusCode, model, null);
                } else {
                    callbackError({ "errorCode": -1003, "errorMessage": `No ebook by that number: '${queryParams.id}'` }, false);
                }
            } catch(err) {
                callbackError(err);
            }
        }).catch((err: any) => {
            callbackError(err);
        });
    }

    getFileHandler(req: http.IncomingMessage, res: http.ServerResponse): void {
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
        let httpHeaders: http.OutgoingHttpHeaders = { "Content-Type" : "text/html" };

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
                            switch(queryParams.format) {
                                case Format.JSON: httpHeaders[Object.keys(httpHeaders)[0]] = Format.JSON;
                                    break;
                                case Format.Plain: httpHeaders[Object.keys(httpHeaders)[0]] = Format.Plain;
                                    break;
                                case Format.XML: httpHeaders[Object.keys(httpHeaders)[0]] = Format.JSON;
                                    break;
                                case Format.RSS: httpHeaders[Object.keys(httpHeaders)[0]] = Format.RSS;
                                    break;
                                case Format.CSV: httpHeaders[Object.keys(httpHeaders)[0]] = Format.CSV;
                                    break;
                            }
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

    private prepareBookdInfo(data: any, isSummary: boolean): BookDetails {
        const $: JQueryStatic = (jquery(new jsdom.JSDOM("").window) as any as JQueryStatic);
        const element: JQuery = $(data);
        let bookDetails: BookDetails;
        let bib_key: string;

        if (element[0].nodeName) {
            if (isSummary) {
                const results: JQuery = $(data).find("l.results li.booklink");
                const linkRef: JQuery = $(data).find("a");
                const spanContent: JQuery = linkRef.find("span.content");
                bib_key = linkRef.attr("href").split("/").reverse()[0];

                bookDetails = {
                    bib_key: bib_key,
                    title: spanContent.find("span.title").text(),
                    authors: [spanContent.find("span.subtitle").text()],
                    downloads: parseInt(spanContent.find("span.extra").text()) || 0,
                    preview_url: null,
                    thumbnail_url: (linkRef.find("img.cover-thumb").length) ? linkRef.find("img.cover-thumb").attr("src") : null,
                    preview: ViewabilityState.Full,
                    selfLink: linkRef.attr("href"),
                    volumeInfo: null,
                    userInfo: null,
                    saleInfo: null,
                    accessInfo: {
                        accessViewStatus: ViewabilityState[ViewabilityState.Full].toString(),
                        pdf: null,
                        webReaderLink: "/books/".concat(bib_key)
                    }
                }
            } else {
                const divBook: JQuery = $(data).find("div#bibrec");
                const previewImg: JQuery = $(data).find("img.cover-art");
                const tableDetails: JQuery = divBook.find("table.bibrec");
                const subjectLinks: JQuery = tableDetails.find("td[property='dcterms:subject'] a");
                bib_key = divBook.find("div[typeof][about]").attr("about").match(/[^:]*(\w+)/g).pop();

                bookDetails = {
                    bib_key: bib_key,
                    title: tableDetails.find("td[itemprop='headline']").text().match(/\w+/g).join(" "),
                    authors: tableDetails.find("td a[itemprop='creator']:first").text().split(","),
                    downloads: parseInt(tableDetails.find("td[itemprop='interactionCount']").text().match(/\d+/g)[0]) || 0,
                    preview_url: (previewImg && previewImg.length) ? previewImg.attr("src") : null,
                    thumbnail_url: (previewImg && previewImg.length) ? previewImg.attr("src") : null,
                    preview: ViewabilityState.Full,
                    selfLink: "/books/".concat(bib_key),
                    volumeInfo: {
                        subjects: (subjectLinks && subjectLinks.length) ? subjectLinks.map((idx: number, item: any) => {
                                    return item.innerText;
                                }).toArray() : null,
                        language: $(tableDetails).find("tr[itemprop='inLanguage'] td:first").text(),
                        publisher: $(tableDetails).find("td a[itemprop='creator']:last").text().split(","),
                        mainCategory: tableDetails.find("td[property='dcterms:type']").text(),
                        publishedDate: tableDetails.find("td[itemprop='datePublished']").text(),
                        industryIdentifiers: [{
                            type: "copyright",
                            identifier: tableDetails.find("td[property='dcterms:rights']").text()
                        }],
                        description: tableDetails.attr("summary")
                    },
                    userInfo: null,
                    saleInfo: {
                        country: "Unknown",
                        retailPrice: {
                            amount: parseInt(tableDetails.find("tr[itemprop='offers'] td span[itemprop='price']").text().match(/\d+(\.\d{1,2})?/g).pop()),
                            currencyCode: "USD",
                        }
                    },
                    accessInfo: {
                        accessViewStatus: ViewabilityState[ViewabilityState.Full].toString(),
                        pdf: null,
                        webReaderLink: "/books/".concat(bib_key)
                    }
                }
            }
        }
        return bookDetails;
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
