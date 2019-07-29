const server = require("./src/server.js");

let app = server.get();
server.start(app);