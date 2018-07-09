/**
 * Own
 */
//#region enums
import { Format } from "shared";
//#endregion

//#region models
import { Book } from "./book.model";
import { ServerPaging } from "../../shared/models/server-paging.model";
//#endregion

export interface BookFile {
    book: Book;
    format: Format
    content: string;
    fetchInfo: ServerPaging;
}
