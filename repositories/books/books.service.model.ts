import { RequestPromise } from "request-promise";
/**
 * Own
 */
//#region models
import { Book } from "./book.model";
import { BookDetails } from "./book-details.model";
import { BookFile } from "./file.model";
import { IHttpResource } from "../../config/http/http-resource.model";
//#endregion

export interface IBooksService {
    getBooks(word?: string): IHttpResource<Book[]>;
    getBookDetails(isbn: string): IHttpResource<BookDetails>;
    getBookFile(isbn: string, urlFile: string): IHttpResource<BookFile>;
}
