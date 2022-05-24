const Server = require("./commonLocal/NodeServer.js");

let port = process.argv.length > 2 ? process.argv[2] : 3001;
let file = process.argv.length > 3 ? process.argv[3] : "index.html";
const app = Server(port, file);