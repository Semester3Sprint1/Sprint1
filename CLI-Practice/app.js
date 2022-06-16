const fs = require("fs");
const { configApp } = require("./config");
const { initApp } = require("./init");
const { tokenApp } = require("./token");
global.DEBUG = true;
const myArgs = process.argv.slice(2);

const myApp = () => {
  DEBUG && console.log(myArgs);
  switch (myArgs[0]) {
    case "config":
    case "c":
      DEBUG && console.log("config app accessed");
      configApp();
      break;
    case "init":
    case "i":
      DEBUG && console.log("init app accessed");
      initApp();
      break;
    case "token":
    case "t":
      DEBUG && console.log("token app accessed");
      tokenApp();
      break;
    case "help":
    case "h":
    default:
      DEBUG && console.log("help accessed");
      fs.readFile(__dirname + "/usage.txt", (err, data) => {
        if (err) throw err;
        console.log(data.toString());
      });
  }
};

myApp();
