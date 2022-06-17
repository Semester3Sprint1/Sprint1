const http = require("http");
const port = 3000;
const routes = require("./routes");
// const { myEmitter } = require("./events");
const startTime = new Date();

const server = http.createServer((req, res) => {
  var path = "./html/";
  switch (req.url) {
    case "/":
      res.statusCode = 200;
      path += "index.html";
      routes.displayFile(path, res, "Home");
      break;
    case "/style":
      res.statusCode = 200;
      path = "./css/style.css";
      routes.displayFile(path, res, "CSS");
      break;
    case "/config":
      res.statusCode = 200;
      path = "./config.json";
      routes.displayFile(path, res, "Config");
      break;
    case "/token":
      res.statusCode = 200;
      path += "token.html";
      routes.displayFile(path, res, "Token");
      break;
    case "/tokens":
      res.statusCode = 200;
      path = "./tokens.json";
      routes.displayFile(path, res, "Tokens");
      break;
    default:
      // In the event of a non-existant page
      path += "404.html";
      res.statusCode = 404;
      routes.displayFile(path, res, "404");
      break;
  }
});

const runServer = () => {
  server.listen(port, "localhost");
  console.log(`Server listening on port ${port}, press CTRL + C to cancel...`);
};

module.exports = { runServer };
