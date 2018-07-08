import { ConfigUrl } from "../url";

export class Api {
    public url: ConfigUrl;
    public apiVersion: string;

    constructor() {
        this.url = new ConfigUrl();
        this.apiVersion = "/api/v1";
    }
}
