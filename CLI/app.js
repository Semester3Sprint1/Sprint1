/****************
 * Semester 3, Sprint 1
 *
 * Team 1 - Members: Alex Ridgeley, Mike Wadden, Cody Barrett
 *
 * Due Date: 24 June 2022
 *
 *  ****************/

const fs = require("fs");
const { configApp } = require("./js/config");
const { initApp } = require("./js/init");
const { tokenApp } = require("./js/token");
const { runServer } = require("./js/server");
const { uninstall } = require("./js/uninstall");
global.DEBUG = false;
const myArgs = process.argv.slice(2);

const myApp = () => {
  // DEBUG && console.log(myArgs);
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
    case "server":
    case "s":
      DEBUG && console.log("server accessed");
      runServer();
      break;
    case "uninstall":
    case "u":
      DEBUG && console.log("uninstall attempted");
      uninstall();
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
