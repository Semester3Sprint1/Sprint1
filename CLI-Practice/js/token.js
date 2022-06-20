const crc32 = require("crc/crc32");
// const { format } = require("date-fns");

const fs = require("fs");
const path = require("path");
const tokenPath = path.join(__dirname, "..", "tokens.json");
const prompt = require("prompt-sync")({ sigint: true });
const { myEmitter } = require("./events");

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

const tokenApp = () => {
  const myArgs = process.argv.slice(2);

  switch (myArgs[1]) {
    case "--new":
      newToken(myArgs[2]);
      break;
    case "--add":
      editDetail(myArgs[2], myArgs[3], myArgs[4]);
      break;
    case "--count":
      countTokens();
      break;
    case "--search":
      searchToken(myArgs[2], myArgs[3]);
      break;
    case "--expired":
      checkExpire();
      break;
    case "--login":
      login(myArgs[2]);
      break;
    case "help":
    case "h":
    default:
      fs.readFile(
        path.join(__dirname, "..", "views", "token.txt"),
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

const searchToken = (arg, element) => {
  fs.readFile(tokenPath, (error, data) => {
    if (error) throw error;
    // if (DEBUG) console.log(JSON.parse(data));
    let tokens = JSON.parse(data);
    let match = false;
    myEmitter.emit("cmd", "token.searchToken()", "INFO", "Searched for token");

    tokens.forEach((token) => {
      if (arg === "u") {
        var searchTarget = token.username;
      } else if (arg === "e") {
        var searchTarget = token.email;
      } else if (arg === "p") {
        var searchTarget = token.phone;
      } else {
        console.log("Invalid entry. Please search by either 'u', 'e', or 'p'.");
      }
      if (searchTarget.toLowerCase() === element.toLowerCase()) {
        // Check for the argument here - it will determine which field of the token will be changed
        console.log(token);
        match = true;
      }
    });

    if (!match) {
      console.log(`Error. ${element} not found. Please try another.`);
    }
  });
};

const countTokens = () => {
  fs.readFile(tokenPath, (error, data) => {
    if (error) throw error;
    myEmitter.emit("cmd", "token.countToken()", "INFO", "Counted tokens");
    let tokens = JSON.parse(data);
    let tokenCount = tokens.length;
    console.log(`Number of tokens: ${tokenCount}`);
  });
};

const editDetail = (arg, username, element) => {
  let match = false;
  fs.readFile(tokenPath, (error, data) => {
    if (error) throw error;
    // if (DEBUG) console.log(JSON.parse(data));
    let tokens = JSON.parse(data);

    tokens.forEach((token) => {
      if (token.username === username) {
        // Check for the argument here - it will determine which field of the token will be changed
        if (arg === "p") {
          token.phone = element;
        } else if (arg === "e") {
          token.email = element;
        } else {
          console.log("Error. Invalid argument entered. Please try again.");
        }
        match = true;
      }
    });

    if (!match) {
      console.log(
        `Error. ${username} is not a valid token. Please try another.`
      );
    } else {
      data = JSON.stringify(tokens, null, 2);
      fs.writeFile(tokenPath, data, (error) => {
        if (error) throw error;
        myEmitter.emit(
          "cmd",
          "token.editDetail()",
          "INFO",
          "Edited token detail"
        );
      });
    }
  });
};

const newToken = (username, location = "") => {
  let now = new Date();
  let expires = addDays(now, 3);

  // Create default newToken object, we will modify this and save it to the file
  let newToken = JSON.parse(`{
    "created": "1969-01-31 12:30:00",
    "username": "username",
    "email": "user@example.com",
    "phone": "7096548900",
    "token": "token",
    "expires": "1969-02-03 12:30:00",
    "confirmed": "tbd"
}`);

  newToken.created = now.toLocaleDateString();

  if (location === "client") {
    // If the function is coming from the clinet-side, we will run these variables through the function
    let object = username;
    newToken.username = object.username;
    newToken.email = object.email;
    newToken.phone = object.phone;
    newToken.token = crc32(object.username).toString(16);
  } else {
    // Otherwise, we will prompt the user to enter the values now.
    newToken.username = username;
    newToken.email = prompt("Enter your email: ");
    newToken.phone = prompt("Enter your phone number: ");
    newToken.token = crc32(username).toString(16);
  }
  newToken.expires = expires.toLocaleDateString();

  let userTokens = fs.readFileSync(tokenPath, "utf-8"); // Scan file, save list of users to this variable
  let tokens = JSON.parse(userTokens);
  tokens.push(newToken);
  userTokens = JSON.stringify(tokens, null, 2);

  // Read tokens.json file and replace existing list with new list
  fs.writeFile(tokenPath, userTokens, (err) => {
    if (err) throw err;
    DEBUG && console.log(userTokens);
    myEmitter.emit("cmd", "token.newToken()", "INFO", "Added new token");
  });
};

function checkDays(expiry) {
  let now = new Date().getDate();
  var expire = new Date(expiry).getDate() + 1; // The + 1 is used here because the expiry date was rounding down
  if (expire < now) {
    return true;
  } else {
    return false;
  }
}

const checkExpire = () => {
  fs.readFile(tokenPath, (error, data) => {
    if (error) throw error;
    // if (DEBUG) console.log(JSON.parse(data));
    let tokens = JSON.parse(data);
    let match = false;
    myEmitter.emit(
      "cmd",
      "token.checkExpire()",
      "INFO",
      "Checked tokens for expiry"
    );

    tokens.forEach((token) => {
      if (checkDays(token.expires)) {
        console.log(token.username, "- I have expired");
        console.log();
      } else {
        console.log(token.username, "- I have not expired");
        console.log();
      }
    });
  });
};

const login = (username, token) => {
  fs.readFile(tokenPath, (error, data) => {
    if (error) throw error;
    // if (DEBUG) console.log(JSON.parse(data));
    let tokens = JSON.parse(data);
    let match = false;
    myEmitter.emit("cmd", "token.login()", "INFO", "Login attempted");

    tokens.forEach((token) => {
      if (token.username === username) {
        DEBUG && console.log("Step 1 complete - user found");
        match = true;
        if (!checkDays(token.expires)) {
          console.log(`Token valid. Login complete. Welcome, ${username}.`);
        } else {
          console.log(
            "Token has expired. System will create new token for user."
          );
          // Update existing user
          token.expires = addDays(new Date(), 3).toLocaleDateString();
          data = JSON.stringify(tokens, null, 2);
          fs.writeFile(tokenPath, data, (error) => {
            if (error) throw error;
            myEmitter.emit(
              "cmd",
              "token.login()",
              "INFO",
              "Updated token expiry"
            );
          });
          // Create new user
          // newToken(token, "client");
          // console.log("Please repeat login with new token.");
        }
      }
    });
    if (!match) {
      console.log("Invalid credentials. Username does not exist.");
    } else {
      myEmitter.emit("cmd", "token.login()", "INFO", "Login successful");
    }
  });
};

module.exports = { tokenApp, newToken, checkDays };
