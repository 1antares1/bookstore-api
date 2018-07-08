import { IncomingMessage, ServerResponse } from "http";
import * as https from "https";
import { info } from "console";

/**
 * Own
 */
import Index from "./index";

const httpPort = normalizePort(process.env.PORT || 5000);
const httpsPort = normalizePort(8443);
const app = Index.bootstrap(null).httpService;

//#region certificates
const certsPath = "certs";
// const sslOptions = {
//     ca: [readFileSync(join(certsPath, "CACert.crt"))],
//     key: readFileSync(join(certsPath, "gbh.com.do.key.pem")),
//     cert: readFileSync(join(certsPath, "gbh.com.do.cert.pem"))
// };
//#endregion

let server: https.Server;

function normalizePort(val: number | string): number | string | boolean {
    const port: number = (typeof val === "string") ? parseInt(val, 10) : val;
    if (isNaN(port)) {
        return val;
    } else
    if (port >= 0) {
        return port;
    } else {
        return false;
    }
}

function onListening(): void {
    const addr = server.address();
    const bind = (typeof addr === "string") ? `pipe ${addr}` : `port ${addr.port}`;
}

function onError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== "listen") {
        throw error;
    }
    const bind = (typeof httpPort === "string") ? "Pipe " + httpPort : "Port " + httpPort;

    switch (error.code) {
        case "EACCES":
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;

        case "EADDRINUSE":
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;

        default:
            throw error;
    }
}

app.listen(process.env.PORT || 5000, () => {
    info(" Node.js server listening on port ".concat(process.env.PORT || "5000"));
});

// sslOptions - disabled (missing certs)
server = https.createServer(null, (req: IncomingMessage, res: ServerResponse) => {
    res.writeHead(200);
    res.end("Welcome to HTTPS Server\n");
}).listen(httpsPort), () => {
    info(" HTTPS Node.js server started on port ".concat(server.address().toString()));
};

server.on("error", onError);
server.on("listening", onListening);
