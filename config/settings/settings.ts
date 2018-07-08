import * as path from "path";

/**
 * Own
 */
//#region models
import { IServerSettings } from "./settings.model";
//#endregion

export class ServerSettings implements IServerSettings {
    //#region static properties
    public static IS_DEVELOPMENT: boolean = (process.env && process.env.NODE_ENV) ? process.env.NODE_ENV.indexOf("production") === -1 : false;
    public static STATIC_ROOT_PATH: string;
    //#endregion

    //#region properties
    public isDevelopment: boolean;
    public devHost: string;
    public faviconPath: string;
    public indexPath: string;
    public downPath: string;
    public metaPath: string;
    //#endregion

    private $self: ServerSettings;

    constructor() {
        this.initSettings();
    }

    public static getAssetPaths(baseOnly?: boolean): string[] {
        const baseRoute = "/assets";
        return (baseOnly) ? [baseRoute] : ["".concat(baseRoute, "/icons"), "".concat(baseRoute, "/img"), "".concat(baseRoute, "/templates"), "".concat("/meta")];
    }

    public initSettings(): void {
        const $self: ServerSettings = this;
        const indexFile = "index.html";
        this.isDevelopment = ServerSettings.IS_DEVELOPMENT;

        if (this.isDevelopment) {
            this.devHost = "http://localhost:5000";
            ServerSettings.STATIC_ROOT_PATH = "/public";
        } else {
            ServerSettings.STATIC_ROOT_PATH = "/public";
        }
        $self.indexPath = path.join(ServerSettings.STATIC_ROOT_PATH, indexFile);
        $self.faviconPath = path.join((ServerSettings.STATIC_ROOT_PATH), `${ServerSettings.getAssetPaths()[0]}/favicon.ico`);
        $self.downPath = path.join(ServerSettings.STATIC_ROOT_PATH, `${ServerSettings.getAssetPaths()[2]}/maintenance.html`);
        $self.metaPath = path.join(ServerSettings.STATIC_ROOT_PATH, `${ServerSettings.getAssetPaths()[3]}`);
    }
}
