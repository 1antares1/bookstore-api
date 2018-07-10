/**
 * Own
 */
//#region models
import { PdfInfo } from "./pdf-info.model";
//#endregion

export interface AccessInfo {
    pdf: PdfInfo;
    webReaderLink: string;
    accessViewStatus: string;
    country?: string;
    viewability?: string;
    embeddable?: boolean;
    publicDomain?: boolean;
    textToSpeechPermission?: string;
}
