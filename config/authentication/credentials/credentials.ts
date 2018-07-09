import { ICredentials } from "./credentials.model";
import { enc, HmacSHA256, Hash, DecryptedMessage } from "crypto-js";

export class Credentials implements ICredentials {
    public dateTimeHeaderValue: string;
    public token: string;

    constructor(private apiKeyId: string, private apiKey: string, private absolutePath: string) {
        const date = new Date();
        const dateString = date.toUTCString().replace("UTC", "GMT");
        const signature = this.getDigitalSignature(apiKey, absolutePath, dateString);
        this.token = `${apiKeyId}:${signature}`;
        this.dateTimeHeaderValue = dateString;
    }

    public getDigitalSignature(apiKey: string, relativeUrl: string, dateAsString: string): string {
        const stringToSign = dateAsString.concat("\n", relativeUrl);
        const stringToSignBytes = enc.Utf8.parse(stringToSign);
        const apiKeyBytes = enc.Base64.parse(apiKey);
        const hash = HmacSHA256(stringToSignBytes, apiKeyBytes) as DecryptedMessage;
        return hash.toString(enc.Base64);
    }
}
