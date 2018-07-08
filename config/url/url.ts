/**
 * Own
 */
// models
import {
    IConfigUrl,
    IConfigUrlFragment
} from "../url/url.model";

export class ConfigUrl implements IConfigUrl {
    public fragments: IConfigUrlFragment;
    public identity: string;
    public externalIdentity: string;
    public profile: string;
    public crm: string;
    public events: string;
    public instructionSheets: string;
    public finances: string;
    public manufacturing: string;
    public pim: string;
    public translation: string;

    constructor() {
        this.init();
    }

    public init(): void {
        this.initFragments();
    }

    public initFragments(): void {
        this.fragments = new Object() as IConfigUrlFragment;
        this.fragments[-1] = "/";
        this.fragments["logon"] = "/users/logon";
        this.fragments["me"] = "/me";
        this.fragments["users"] = "/users";
        this.fragments["products"] = "/products";
        this.fragments["states"] = "/states";
        this.fragments["customers"] = "/customers";
        this.fragments["inquiry"] = "/inquiry";
        this.fragments["passcodes"] = "/passcodes";
        this.fragments["passwordPolicies"] = "/passwords/policies";
        this.fragments["passwords"] = "/passwords";
    }
}
