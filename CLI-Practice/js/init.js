const fs = require("fs");
const fsPromise = require("fs").promises;
const path = require("path");
const {
  initText,
  configText,
  configJson,
  tokenText,
  defaultToken,
} = require("./templates");
const { myEmitter } = require("./events");

const myArgs = process.argv.slice(2);

const initApp = () => {
  switch (myArgs[1]) {
    case "--mk":
      DEBUG && console.log("--mk accessed - create init file and directory");
      createInit();
      setTimeout(() => {
        console.log("Initialization complete.");
      }, 1000);
      break;
    case "--cat":
      DEBUG &&
        console.log(
          "--cat accessed - creates the config file with default settings"
        );
      createConfig();
      setTimeout(() => {
        console.log("Initialization complete.");
      }, 1000);
      break;
    case "--tkn":
      DEBUG && console.log("--tkn accessed - creates the token file");
      createToken();
      setTimeout(() => {
        console.log("Initialization complete.");
      }, 1000);
      break;
    case "--all":
      DEBUG &&
        console.log(
          "--all accessed - creates init files, config file and directory, & token files"
        );
      createInit();
      createConfig();
      createToken();
      setTimeout(() => {
        console.log("Initialization complete.");
      }, 1000);
      break;
    case "help":
    case "h":
    default:
      fs.readFile(
        path.join(__dirname, "..", "views", "init.txt"),
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

const createToken = () => {
  // Check to see if token file exists, if not create default
  try {
    let tokenData = JSON.stringify(defaultToken, null, 2);
    if (!fs.existsSync(path.join(__dirname, "..", "tokens.json"))) {
      fs.writeFile(
        path.join(__dirname, "..", "tokens.json"),
        tokenData,
        (err) => {
          if (err) throw err;
          myEmitter.emit(
            "cmd",
            "init.createToken()",
            "INFO",
            "Created token file"
          );
        }
      );
    } else {
      DEBUG &&
        console.log("Tokens file already exists - no need to create again");
    }
  } catch (error) {
    console.log(error);
  }
};

const createInit = () => {
  // Create the text help files for init and config
  if (fs.existsSync(path.join(__dirname, "..", "views"))) {
    // If the directory already exists, just create the files
    createHelpFiles();
  } else {
    // If the directory doesn't exist, create it first, then create the files
    fs.mkdir(path.join(__dirname, "..", "views"), (err) => {
      if (err) throw err;
      else if (DEBUG) console.log("View directory created");
    });
    createHelpFiles();
  }
};

const createHelpFiles = () => {
  fs.writeFile(
    path.join(__dirname, "..", "views", "init.txt"),
    initText,
    (err) => {
      if (err) throw err;
      else if (DEBUG) console.log("Data written to init.txt file");
    }
  );
  fs.writeFile(
    path.join(__dirname, "..", "views", "config.txt"),
    configText,
    (err) => {
      if (err) throw err;
      else if (DEBUG) console.log("Data written to config.txt file");
    }
  );
  fs.writeFile(
    path.join(__dirname, "..", "views", "token.txt"),
    tokenText,
    (err) => {
      if (err) throw err;
      else if (DEBUG) console.log("Data written to token.txt file");
    }
  );
  myEmitter.emit("cmd", "init.createInit()", "INFO", "Create help files");
};

const createConfig = () => {
  try {
    let data = JSON.stringify(configJson, null, 2);
    if (!fs.existsSync(path.join(__dirname, "..", "config.json"))) {
      fs.writeFile(path.join(__dirname, "..", "config.json"), data, (err) => {
        if (err) throw err;
        else
          myEmitter.emit(
            "cmd",
            "init.createConfig()",
            "INFO",
            "Created config file"
          );
      });
    } else {
      if (DEBUG) console.log("Config file already exists");
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = { initApp };
