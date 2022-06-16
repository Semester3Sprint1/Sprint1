const fs = require("fs");
const fsPromise = require("fs").promises;
const path = require("path");
const { initText, configText, configJson, tokenText } = require("./templates");

const myArgs = process.argv.slice(2);

const initApp = () => {
  switch (myArgs[1]) {
    case "--mk":
      DEBUG && console.log("--mk accessed - create init file and directory");
      createInit();
      break;
    case "--cat":
      DEBUG &&
        console.log(
          "--cat accessed - creates the config file with default settings"
        );
      createConfig();
      break;
    case "--all":
      DEBUG &&
        console.log(
          "--cat accessed - creates the folder structure and config file"
        );
      createInit();
      createConfig();
      break;
    default:
      fs.readFile(path.join(__dirname, "views", "init.txt"), (error, data) => {
        if (error) throw error;
        else {
          DEBUG && console.log("default accessed - display help file");
          console.log(data.toString());
        }
      });
  }
};

const createInit = () => {
  // Create the text help files for init and config
  if (fs.existsSync(path.join(__dirname, "./views"))) {
    // If the directory already exists, just create the files
    createHelpFiles();
  } else {
    // If the directory doesn't exist, create it first, then create the files
    fs.mkdir(path.join(__dirname, "views"), (err) => {
      if (err) throw err;
      else if (DEBUG) console.log("Directory created");
    });
    createHelpFiles();
  }
};

const createHelpFiles = () => {
  fs.writeFile(path.join(__dirname, "views", "init.txt"), initText, (err) => {
    if (err) throw err;
    else if (DEBUG) console.log("Data written to init.txt file");
  });
  fs.writeFile(
    path.join(__dirname, "views", "config.txt"),
    configText,
    (err) => {
      if (err) throw err;
      else if (DEBUG) console.log("Data written to config.txt file");
    }
  );
  fs.writeFile(path.join(__dirname, "views", "token.txt"), tokenText, (err) => {
    if (err) throw err;
    else if (DEBUG) console.log("Data written to token.txt file");
  });
};

const createConfig = () => {
  try {
    let data = JSON.stringify(configJson, null, 2);
    if (!fs.existsSync(path.join(__dirname, "config.json"))) {
      fs.writeFile("config.json", data, (err) => {
        if (err) throw err;
        else if (DEBUG) console.log("Config.json file created");
      });
    } else {
      if (DEBUG) console.log("Config file already exists");
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = { initApp };
