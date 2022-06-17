const fs = require("fs");
const path = require("path");
const { myEmitter } = require("./events");

// This file can be used to display more than simply html files - we could also display images or other data this way
const displayFile = (filePath, res, location) => {
  if (res.statusCode == 410) {
    var filePath = "../html/410.html";
    var location = "404";
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      if (location !== "Home") {
        // This will serve as our "console.log()" for each switch, so we know it is working corrently - we don't need this to fire off every time someone goes home
        myEmitter.emit("pageVisit", location, res);
      }

      // This will identify the file extension of the file being delivered, and will alter the Content-Type appropriately
      var extName = path.extname(filePath);

      switch (extName) {
        case ".json":
          var content = "application/json";
          break;
        case ".txt":
          var content = "text/plain";
          break;
        case ".css":
          var content = "text/css";
          break;
        case ".avif":
          var content = "Image/avif";
          break;
        default:
          var content = "text/html";
          break;
      }
      // res.setHeader("Set-cookie", `${location}Visit=True`);
      res.writeHead(res.statusCode, { "Content-Type": content });
      res.write(data);
      res.end();
    }
  });
};

// const displayCSS = (filePath, res) => {
//   // Loads a css file onto the server
// };

module.exports = { displayFile };
