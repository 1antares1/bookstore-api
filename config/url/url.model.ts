import { ITuple } from "@shared/models/tuple";

export interface IConfigUrl {
    fragments: IConfigUrlFragment;
    identity: string;
    profile: string;
    categories: string;
    books: string;
    files: string;
    translation: string;
}

export interface IConfigUrlFragment {
    [index: string]: string;
}
