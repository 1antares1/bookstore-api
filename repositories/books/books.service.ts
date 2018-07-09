import { RequestPromise } from "request-promise";

/**
 * Own
 */
//#region models
import { IBooksService } from "./books.service.model";
import { Book } from "./book.model";
import { BookDetails } from "./book-details.model";
import { BookFile } from "./file.model";
import { IHttpResource } from "config/http";
//#endregion

//#region services
import { DataService } from "../data.service";
import { RequestMethod } from "../../config/api/rest-method";
//#endregion

export class BooksService extends DataService implements IBooksService {
    constructor() {
        super("Books");
    }

    public getBooks(): IHttpResource<Book[]> {
        const urlFragment = this.getConfigService().appSettings.urls.fragments["ebooks"];
        const request = this.getAnonymousResource<Book[]>(urlFragment);
        return RequestMethod<Book[]>(request);
    }

    public getBookDetails(): IHttpResource<Book[]> {
        const urlFragment = this.getConfigService().appSettings.urls.fragments["ebooks/details"];
        const request = this.getAnonymousResource<Book[]>(urlFragment);
        return RequestMethod<Book[]>(request);
    }

    public getBookFile(): IHttpResource<Book[]> {
        const urlFragment = this.getConfigService().appSettings.urls.fragments["file"];
        const request = this.getAnonymousResource<Book[]>(urlFragment);
        return RequestMethod<Book[]>(request);
    }
}
