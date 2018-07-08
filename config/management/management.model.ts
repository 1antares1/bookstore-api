/**
 * Own
 */
//#region models
import { IAppMaintenance } from "../maintenance/maintenance.model";
//#endregion

export interface IAppManagement {
    maintenance: IAppMaintenance;
}

export interface IAppConfig {
    management: IAppManagement;
    supportEmail: string;
}
