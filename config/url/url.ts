/**
 * Own
 */
// models
import { IConfigUrl, IConfigUrlFragment } from "../url/url.model";

export class ConfigUrl implements IConfigUrl {
    public fragments: IConfigUrlFragment;
    public identity: string;
    public profile: string;
    public categories: string;
    public books: string;
    public files: string;
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
        this.fragments["ebooks"] = "/ebooks";
        this.fragments["files"] = "/files";
    }
}
