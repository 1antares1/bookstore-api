/**
 * Own
 */
//#region models
import { Book } from "./book.model";
import { VolumeInfo } from "./models/volume-info.model";
import { UserInfo } from "./models/user-info.model";
import { SaleInfo } from "./models/sales-info.model";
import { AccessInfo } from "./models/access-info.model";
//#endregion

export interface BookDetails extends Book {
    kind: string;
    id: string;
    etag: string;
    selfLink: string;
    volumeInfo: VolumeInfo;
    userInfo: UserInfo;
    saleInfo: SaleInfo;
    accessInfo: AccessInfo;
}
