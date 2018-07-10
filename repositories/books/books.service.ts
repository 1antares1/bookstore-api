import { clone } from "lodash/fp";

/**
 * Own
 */
//#region models
import { IBooksService } from "./books.service.model";
import { Book } from "./book.model";
import { BookDetails } from "./book-details.model";
import { BookFile } from "./file.model";
import { IHttpResource } from "config/http";
import { Format } from "../../shared/enums/format.enum";
//#endregion

//#region services
import { DataService } from "../data.service";
import { RequestMethod } from "../../config/api/rest-method";

//#endregion

export class BooksService extends DataService implements IBooksService {
    constructor() {
        super("Books");
    }

    public getBooks(word?: string): IHttpResource<Book[]> {
        const urlFragment = `${this.getConfigService().appSettings.urls.fragments["ebooks"]}/search/?query=${word || ""}`;
        const request = this.getAnonymousResource<Book[]>(urlFragment, true, true);
        return RequestMethod<Book[]>(request);
    }

    public getBookDetails(isbn: string): IHttpResource<BookDetails> {
        const urlFragment = `${this.getConfigService().appSettings.urls.fragments["ebooks"]}/${isbn}`;
        const request = this.getAnonymousResource<Book[]>(urlFragment, true, true);
        return RequestMethod<Book[]>(request);
    }

    public getBookFile(isbn: string, urlFile: string): IHttpResource<BookFile> {
        const request = this.getAnonymousResource<Book[]>(urlFile, true, true);
        return RequestMethod<Book[]>(request);
    }
}
