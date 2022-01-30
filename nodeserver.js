const http = require("http");
const zlib = require("zlib");
const fs = require("fs");
const os = require("os");
const url = require("url");
const path = require("path");
const ws = require("ws");
const mime = require("./mime");

function Server(port, defaultFile) {
    let self;

    function requestError(res, err) {
        console.log("Error");
        res.writeHead(err, {"Content-Type": "text/plain"});
        res.end(null);
    }

    function fileNotFound(res) {
        console.log("Not found");
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.end(null);
    }

    function rootRedirect(res) {
        console.log("Redirected");
        res.setHeader("Location", "/");
        res.setHeader("Content-Type", "text/html");
        res.end(null);
    }

    function serveFile(res, filePath) {
        console.log("Reading file " + filePath);
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
            let pathname = url.parse(req.url).pathname;
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
            console.log(pathname, dir);
            switch (dir) {
                case "res/js":
                case "res/css":
                case "res/img":
                case "common/js":
                case "common/css":
                case "common/img":
                    mimeType = mime.get_web_mime_type(path.extname(fileName));
                    break;
                default:
                    res.setHeader('Content-type', mime.get_file_mime_type(".html"));
                    serveFile(res, defaultFile);
                    return;
            }
            //console.log(mimeType, path.extname(fileName));
            if(mimeType === null) {
                fileNotFound(res);
                return;
            }
									
            let filePath = path.resolve(path.join(dir, fileName));
			console.log(filePath);
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
    let wss = new ws.Server({ noServer : true });
    wss.on("connection", function(ws, request, connection_host) {
        console.log(ws);
        ws.on("close", function(code) {
        });
    });

    self.server.listen(port, "", () => {
        console.log(`Listening on ${port}`);
    }).on("upgrade", function(request, socket, head) {
        wss.handleUpgrade(request, socket, head, function(ws) {
            wss.emit("connection", ws, request, host_server);
        });
    });

    return self;
};

let file = process.argv.length > 2 ? process.argv[2] : "index.html";
const app = Server(3001, file);