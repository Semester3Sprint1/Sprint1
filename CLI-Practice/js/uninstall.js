const fs = require("fs");
const fsPromise = require("fs").promises;
const path = require("path");
const prompt = require("prompt-sync")({ sigint: true });

const uninstall = () => {
  var confirmation = prompt(
    "Are you sure you wish to install the app? ('YES'/'NO'): "
  );
  if (confirmation === "YES") {
    removeConfig();
    removeViews();
    removeTokens();
  } else {
    console.log(
      "\nWhew. I thought I was a goner.\nYou either messed up the confirm prompt or you really don't want to kill me.\nI appreciate it, either way."
    );
  }
};

const removeConfig = () => {
  fs.unlink(path.join(__dirname, "..", "config.json"), (err) => {
    if (err) throw err;
    console.log("Config file deleted.");
  });
};

const removeViews = () => {
  fs.rm(
    path.join(__dirname, "..", "views"),
    { recursive: true, force: true },
    (err) => {
      if (err) throw err;
      console.log("Views folder deleted.");
    }
  );
};

const removeTokens = () => {
  fs.unlink(path.join(__dirname, "..", "tokens.json"), (err) => {
    if (err) throw err;
    console.log("Tokens deleted.");
  });
};

module.exports = { uninstall };
