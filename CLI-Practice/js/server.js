const http = require("http");
const port = 3000;
const routes = require("./routes");
// const { myEmitter } = require("./events");
const { newToken, confirmToken } = require("./token");
const startTime = new Date();
const crc32 = require("crc/crc32");
const StringDecoder = require("string_decoder").StringDecoder;

const server = http.createServer((req, res) => {
  var path = "./html/";

  if (req.method == "POST") {
    handleXHR(req, res);
  }
  // This code runs if the client makes a POST request (which they will if they fill out the "new token" form)
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
    case "/login":
      res.statusCode = 200;
      path += "login.html";
      routes.displayFile(path, res, "Login");
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

const handleXHR = (req, res) => {
  DEBUG && console.log("POST");
  let buffer = "";
  let decoder = new StringDecoder();

  req.on("data", (data) => {
    console.log(data);
    buffer += decoder.write(data);
    console.log(buffer);
  });
  req.on("end", () => {
    buffer += decoder.end();
    usableData = JSON.parse(buffer);
    console.log("usable data:", usableData);

    // Right now, since we only have two uses for this, we can seperate them based on the length of the Object sent. We'll need to change this if we expand further
    if (Object.keys(usableData).length === 3) {
      newToken(usableData, "client");
    } else {
      confirmToken(usableData);
    }
  });
};

module.exports = { runServer };
