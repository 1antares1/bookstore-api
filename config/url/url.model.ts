import { ITuple } from "@shared/models/tuple";

export interface IConfigUrl {
    fragments: IConfigUrlFragment;
    identity: string;
    externalIdentity: string;
    profile: string;
    translation: string;
}

export interface IConfigUrlFragment {
    [index: string]: string;
}

