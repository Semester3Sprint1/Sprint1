const fs = require("fs");
const fsPromise = require("fs").promises;
const path = require("path");
const { configJson } = require("./templates");

const myArgs = process.argv.slice(2);

const configApp = () => {
  switch (myArgs[1]) {
    case "--show":
      DEBUG && console.log("--show accessed");
      displayConfig();
      break;
    case "--set":
      DEBUG && console.log("--set accessed");
      setConfig();
      break;
    case "--reset":
      DEBUG && console.log("--reset accessed");
      resetConfig();
      break;
    default:
      fs.readFile(
        path.join(__dirname, "views", "config.txt"),
        (error, data) => {
          if (error) throw error;
          else {
            DEBUG && console.log("default accessed - display help file");
            console.log(data.toString());
          }
        }
      );
  }
};

const displayConfig = () => {
  fs.readFile(path.join(__dirname, "config.json"), (error, data) => {
    if (error) throw error;
    else {
      DEBUG && console.log("display current config settings");
      console.log(JSON.parse(data));
    }
  });
};

const setConfig = () => {
  DEBUG && console.log("--- SET CONFIG ---");
  let match = false;
  fs.readFile(path.join(__dirname, "config.json"), (error, data) => {
    if (error) throw error;
    if (DEBUG) console.log(JSON.parse(data));
    let config = JSON.parse(data);
    for (let key of Object.keys(config)) {
      if (key === myArgs[2]) {
        config[key] = myArgs[3];
        match = true;
      }
    }
    if (!match) {
      console.log(
        `Error. ${myArgs[2]} is not a valid field. Please try another.`
      );
    }

    data = JSON.stringify(config, null, 2);
    fs.writeFile("config.json", data, (error) => {
      if (error) throw error;
      DEBUG && console.log("Changed config.json file to reflect updates");
    });
  });
};

const resetConfig = () => {
  let configData = JSON.stringify(configJson, null, 2);
  fs.writeFile("config.json", configData, (err) => {
    if (err) throw err;
    else if (DEBUG) console.log("Config.json reset to default value");
  });
};

module.exports = { configApp };
