/**
 * Own
 */
//#region enums
import { ViewabilityState } from "./book-viewability.enum";
//#endregion

export interface Book {
    bib_key: string;
    title: string;
    authors: string[];
    preview_url: string;
    thumbnail_url: string;
    downloads: number;
    preview?: ViewabilityState;
}
