export interface IHttpInMessage {
    properties: {
            message: any,
            code: number,
            status: string
        };
        links: [{
            rel: string[],
            href: string
        }];
}
