/**
 * Own
 */
//#region models
import { ConfigUrl } from "../url";
//#endregion

export class Api {
    public url: ConfigUrl;
    public apiVersion: string;

    constructor() {
        this.url = new ConfigUrl();
        this.apiVersion = "/api/v1";
    }
}
