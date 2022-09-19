const http = require("http");
const zlib = require("zlib");
const fs = require("fs");
const os = require("os");
const url = require("url");
const path = require("path");
const ws = require("ws");
const mime = require("./mime");

function Server(port, defaultFile, options) {
    options = options || {};
    let self;

    function requestError(res, err) {
        console.log("Error");
        res.writeHead(err, {"Content-Type": "text/plain"});
        res.end(null);
    }

    function fileNotFound(res) {
        console.log("Not found");
        res.writeHead(404, {
            "Content-Type": "text/plain",
        });
        res.end(null);
    }

    function rootRedirect(res) {
        console.log("Redirected");
        res.setHeader("Location", "/");
        res.setHeader("Content-Type", "text/html");
        res.end(null);
    }

    function serveFile(res, filePath) {
//        console.log("Reading file " + filePath);
        fs.readFile(filePath, (err, data) => {
            if(err) {
                fileNotFound(res);
                return;
            }
            else {
                res.end(data);
            }
        });
    }

    self = {
        server: http.createServer((req, res) => {
            let pathname = path.normalize(unescape(url.parse(req.url).pathname));
            if(pathname === "/favicon.ico") {
                pathname = "/res/img/favicon.ico";
            }
            let dir = path.dirname(pathname);
            dir = dir.slice(1, dir.length);
            let mimeType = null;
                // Poison null byte check
            let fileName = unescape(path.basename(pathname)).split("?")[0];
            if (fileName.indexOf('\0') !== -1) {
                requestError(res, 404);
                return;
            }
            let resourcePath = path.resolve(dir);
            let validResourcePaths = [
                "res\\js",
                "res\\css",
                "res\\img",
                "res\\json",
                "common\\js",
                "common\\css",
                "common\\img"
            ].concat(options.validResourcePaths || []);
            let matched = null;
            for(let i = 0; i < validResourcePaths.length; i++) {
                if(!(dir + "\\").startsWith(validResourcePaths[i] + "\\")) continue;
                matched = i;
                if(validResourcePaths[i].endsWith("json") ||
                    validResourcePaths[i].endsWith("csv")) {
                    mimeType = mime.get_file_mime_type(path.extname(fileName));
                }
                else {
                    mimeType = mime.get_web_mime_type(path.extname(fileName));
                }
                break;
            }
            let filePath = path.resolve(path.join(dir, fileName));
            console.log(filePath);
            if(matched === null) {
                res.setHeader('Content-type', mime.get_file_mime_type(".html"));
                serveFile(res, defaultFile);
                return;
            }
            if(mimeType === null && (!options.allowedFileExtensions || options.allowedFileExtensions.indexOf(path.extname(fileName)) === -1)) {
                fileNotFound(res);
                return;
            }

            let truePath = path.resolve(dir);
            if(!filePath.startsWith(truePath)) {
                fileNotFound(res);
                return;
            }

            fs.stat(filePath, function(err, stats) {
                let serveData = true;
                if(!err && stats.isDirectory()) err = 1;
                if(!err) {
                    res.setHeader("ETag", stats.mtimeMs);
                    if("" + req.headers["if-none-match"] === "" + stats.mtimeMs) {
                        res.statusCode = 304;
                        serveData = false;
                    }
                }

                if(!err) {
                    if(serveData) {
                        res.setHeader('Content-type', mimeType);
                        serveFile(res, filePath);
                    }
                    else {
                        res.end();
                    }
                }
                if(err) {
                    fileNotFound(res);
                }
            });
        })
    };
    self.wsServer = new ws.Server({
        noServer : true,
        httpServer: self.server
    });
    self.wsServer.on("connection", (connection, request, host) => {
        connection.on("message", (message) => {
            let args = JSON.parse(message);
            if(typeof args !== "object") args = {};
            let callback = (data) => {
                try {
                    if (typeof data === "string") data = JSON.parse(data);
                }
                catch(e) {
                    data = {
                        err: 1,
                        message: "invalid_request"
                    };
                }
                connection.send(JSON.stringify({
                    id: args.id,
                    data: data
                }));
            };

            let err = 0;
            try {
                if(options.onWSRequest) options.onWSRequest(args.data, callback);
                else err = 1;
            }
            catch(e) {
                err = 1;
                console.error(e);
            }
            if(err) {
                callback({
                    err: err,
                    message: "invalid_request"
                });
            }
        });
        connection.on("close", function(code) {
        });
    });

    self.server.listen(port, "", () => {
        console.log(`Listening on ${port}`);
    }).on("upgrade", function(request, socket, head) {
        self.wsServer.handleUpgrade(request, socket, head, function(ws) {
            console.log("Upgraded connection to WS");
            self.wsServer.emit("connection", ws, request, self.server);
        });
    });

    return self;
};

module.exports = Server;