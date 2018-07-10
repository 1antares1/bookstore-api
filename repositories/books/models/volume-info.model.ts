/**
 * Own
 */
//#region models
import { IndustryIdentifier } from "./identifier.model";
import { Dimensions } from "./dimension.model";
import { ImageLinks } from "./image-links.model";
//#endregion

export interface VolumeInfo {
    publisher?: string[];
    publishedDate?: string;
    description?: string;
    subjects?: string[];
    industryIdentifiers?: IndustryIdentifier[];
    pageCount?: number;
    dimensions?: Dimensions;
    printType?: string;
    mainCategory?: string;
    categories?: string[];
    averageRating?: number;
    ratingsCount?: number;
    contentVersion?: string;
    imageLinks?: ImageLinks;
    language?: string;
    previewLink?: string;
    infoLink?: string;
    canonicalVolumeLink?: string;
}
