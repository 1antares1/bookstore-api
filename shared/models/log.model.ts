export interface IEventLog {
    relatedTo?: string;
    type?: string;
    status?: string;
    location?: string;
    message?: string;
    origin?: string;
    personGuid?: string;
    userName?: string;
    stackTrace?: string;
    payLoad?: string;
    code?: string;
    response?: string;
    buyerCookie?: string;
    header?: string;
    method?: string;
    url?: string;
}
