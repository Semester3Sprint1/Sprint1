const fs = require("fs");
const fsPromise = require("fs").promises;
const path = require("path");
const { configJson } = require("./templates");
const { myEmitter } = require("./events");

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
    case "--add":
      DEBUG && console.log("--add accessed");
      addConfig(myArgs[2], myArgs[3]);
      break;
    case "help":
    case "h":
    default:
      fs.readFile(
        path.join(__dirname, "..", "views", "config.txt"),
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
  myEmitter.emit(
    "cmd",
    "config.displayConfig()",
    "INFO",
    "Display config file"
  );
  fs.readFile(path.join(__dirname, "..", "config.json"), (error, data) => {
    if (error) throw error;
    else {
      DEBUG && console.log("display current config settings");
      console.log(JSON.parse(data));
    }
  });
};

const setConfig = () => {
  let match = false;
  fs.readFile(path.join(__dirname, "..", "config.json"), (error, data) => {
    if (error) throw error;
    if (DEBUG) console.log(`Config file before change:\n`, JSON.parse(data));
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

      // For ease of use, display valid fields here
      console.log("\nValid fields include:");
      Object.entries(config).forEach(([key, value]) => console.log(key));
      console.log();
    } else {
      data = JSON.stringify(config, null, 2);
      fs.writeFile(path.join(__dirname, "..", "config.json"), data, (error) => {
        if (error) throw error;
        DEBUG && console.log("Changed config.json file to reflect updates");
        DEBUG && console.log(`Config file after change:\n`, JSON.parse(data));
      });
      myEmitter.emit(
        "cmd",
        "config.setConfig()",
        "SET CONFIG",
        "Changes made to config file"
      );
      console.log("Config file updated.");
    }
  });
};

const resetConfig = () => {
  let configData = JSON.stringify(configJson, null, 2);
  fs.writeFile(path.join(__dirname, "..", "config.json"), configData, (err) => {
    if (err) throw err;
    else myEmitter.emit("cmd", "config.resetConfig()", "INFO", "Reset config");
  });
  console.log("Config file reset to default values.");
};

const addConfig = (attribute, value) => {
  let match = false;
  fs.readFile(path.join(__dirname, "..", "config.json"), (error, data) => {
    if (error) throw error;
    if (DEBUG) console.log(`Config file before change:\n`, JSON.parse(data));
    let config = JSON.parse(data);
    for (let key of Object.keys(config)) {
      if (key === attribute) {
        match = true;
      }
    }
    if (match) {
      console.log(
        `${attribute} is already stored in the config file. Please choose another.`
      );
      console.log();
    } else {
      config = { ...config, [attribute]: value };
      data = JSON.stringify(config, null, 2);
      fs.writeFile(path.join(__dirname, "..", "config.json"), data, (error) => {
        if (error) throw error;
        DEBUG &&
          console.log("Changed config.json file to include new attribute");
        DEBUG && console.log(`Config file after change:\n`, JSON.parse(data));
      });
      myEmitter.emit(
        "cmd",
        "config.addConfig()",
        "ADD CONFIG",
        "Attribute added to config file"
      );
      console.log("Attribute added to config file.");
    }
  });
};

module.exports = { configApp };
