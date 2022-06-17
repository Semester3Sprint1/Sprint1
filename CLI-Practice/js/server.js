const http = require("http");
const port = 3000;
const routes = require("./routes");
// const { myEmitter } = require("./events");
const { newToken } = require("./token");
const startTime = new Date();

const server = http.createServer((req, res) => {
  var path = "./html/";

  // This code runs if the client makes a POST request (which they will if they fill out the "new token" form)
  if (req.method == "POST") {
    DEBUG && console.log("POST");
    var body = "";
    req.on("data", function (data) {
      body += data;
      DEBUG && console.log("Partial body: " + body);
      var split = body.replace("%40", "@").split("&");

      var keys = []; // Initilize a new array to hold each of our object key/value pairs
      split.forEach((keyValuePair) => {
        let pair = keyValuePair.split("=");
        let object = new Object();
        // The data comes in in a raw format, these .replace()'s are here to convert some special characters back into the normal format
        pair[1] = pair[1]
          .replace("%28", "(")
          .replace("%29", ")")
          .replace("+", " ");
        if (pair[0] === "name") {
          object.name = pair[1];
        }
        if (pair[0] === "email") {
          object.email = pair[1];
        }
        if (pair[0] === "phone") {
          object.phone = pair[1];
        }
        keys.push(object);
      });
      let fullObj = { ...keys[0], ...keys[1], ...keys[2] }; // This line will combine our three objects into one object, which we will then pass into the newToken function
      DEBUG && console.log("new token object: ", fullObj);
      newToken(fullObj, "client");
      // Put this here to handle the default path once the post is done
      res.statusCode = 200;
      path += "token.html";
      routes.displayFile(path, res, "Token");
    });
  } else {
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
  }
});

const runServer = () => {
  server.listen(port, "localhost");
  console.log(`Server listening on port ${port}, press CTRL + C to cancel...`);
};

module.exports = { runServer };
