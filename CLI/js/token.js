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
    case "--show":
      showTokens(myArgs[2]);
      break;
    case "--search":
      searchToken(myArgs[2], myArgs[3]);
      break;
    case "--edit":
      editDetail(myArgs[2], myArgs[3]);
      break;
    case "--count":
      countTokens();
      break;

    case "--login":
      login(myArgs[2], myArgs[3]);
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

// Functions for creating a new token - used both in the CLI and in the Web Server
const newToken = (username, location = "") => {
  let now = new Date();
  let expires = addDays(now, 3);
  if (location === "client") {
    var { username, email, phone } = username;
  }

  // Create default newToken object, we will modify this and save it to the file
  let newToken = JSON.parse(`{
    "created": "1969-01-31 12:30:00",
    "username": "username",
    "email": "user@example.com",
    "phone": "7096548900",
    "token": "token",
    "expires": "1969-02-03 12:30:00",
    "confirmed": false
}`);

  let userTokens = fs.readFileSync(tokenPath, "utf-8"); // Scan file, save list of users to this variable
  let tokens = JSON.parse(userTokens);
  let match = false;

  // Validate the username to make sure that it is not already in use
  tokens.forEach((token) => {
    if (token.username === username) {
      match = true;
    }
  });

  if (!match) {
    if (location !== "client") {
      // Prompt the user to enter the values
      // Validate email
      var valid = false;
      while (!valid) {
        var email = prompt("Enter your email address: ");
        if (newTokenEmail(email)) {
          valid = true;
        }
      }

      // Validate phone number
      var valid = false;
      while (!valid) {
        var phone = prompt("Enter your phone number: ");
        if (newTokenPhone(phone)) {
          valid = true;
        }
      }
    }

    // Set values of the new token
    newToken.username = username;
    newToken.email = newTokenEmail(email);
    newToken.phone = newTokenPhone(phone);
    newToken.token = crc32(username).toString(16);
    newToken.created = now.toLocaleDateString();
    newToken.expires = expires.toLocaleDateString();

    tokens.push(newToken);
    userTokens = JSON.stringify(tokens, null, 2);

    // Read tokens.json file and replace existing list with new list
    fs.writeFile(tokenPath, userTokens, (err) => {
      if (err) throw err;
      DEBUG && console.log(userTokens);
      myEmitter.emit("cmd", "token.newToken()", "INFO", "Added new token");
    });
  } else {
    console.log("Error - that username already exists. Please choose another.");
  }
};

const newTokenPhone = (phoneNum) => {
  // Validates the phone number passed into the function
  var phoneNum = phoneNum.replace(/[()-\s]/g, "");
  if (phoneNum.length !== 10) {
    console.log("Invalid entry. Phone numbers must contain 10 characters.");
    return false;
  } else if (isNaN(phoneNum)) {
    console.log("Invalid entry. A phone number can only contain numbers.");
    return false;
  } else {
    return phoneNum;
  }
};

const newTokenEmail = (email) => {
  // Validates an email address
  if (/@/.test(email) && /\./.test(email)) {
    return email;
  } else {
    console.log("Invalid entry. This is not a valid email address.");
    return false;
  }
};

// Functions for displaying Tokens - options for all tokens, expired tokens, or confirmed tokens
const showTokens = (arg) => {
  if (arg === "confirmed") {
    showConfirmedTokens();
  } else if (arg === "expired") {
    checkExpire();
  } else {
    myEmitter.emit("cmd", "token.showToken()", "INFO", "Display tokens file");
    fs.readFile(path.join(__dirname, "..", "tokens.json"), (error, data) => {
      if (error) throw error;
      else {
        DEBUG && console.log("display current tokens");
        console.log(JSON.parse(data));
      }
    });
  }
};

const showConfirmedTokens = () => {
  fs.readFile(tokenPath, (error, data) => {
    if (error) throw error;
    myEmitter.emit(
      "cmd",
      "token.showConfirmedTokens()",
      "INFO",
      "Showed tokens that have been confirmed by user"
    );
    let tokens = JSON.parse(data);
    tokens.forEach((token) => {
      if (token.confirmed === true) {
        console.log(token);
      }
    });
    console.log("\nCheck complete.");
  });
};

const checkExpire = () => {
  fs.readFile(tokenPath, (error, data) => {
    if (error) throw error;
    // if (DEBUG) console.log(JSON.parse(data));
    let tokens = JSON.parse(data);
    myEmitter.emit(
      "cmd",
      "token.checkExpire()",
      "INFO",
      "Checked tokens for expiry"
    );

    tokens.forEach((token) => {
      if (checkDays(token.expires)) {
        console.log(token);
      }
    });
    console.log("\nCheck complete.");
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

// Function for searching through Tokens
const searchToken = (arg, element) => {
  fs.readFile(tokenPath, (error, data) => {
    if (error) throw error;
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

//Function for counting the Tokens
const countTokens = () => {
  fs.readFile(tokenPath, (error, data) => {
    if (error) throw error;
    myEmitter.emit("cmd", "token.countToken()", "INFO", "Counted tokens");
    let tokens = JSON.parse(data);
    let tokenCount = tokens.length;
    console.log(`Number of tokens: ${tokenCount}`);
  });
};

// Function for editing the Tokens
const editDetail = (arg, username) => {
  let match = false;
  fs.readFile(tokenPath, (error, data) => {
    if (error) throw error;
    // if (DEBUG) console.log(JSON.parse(data));
    let tokens = JSON.parse(data);
    var valid = false;

    tokens.forEach((token) => {
      if (token.username === username) {
        // Check for the argument here - it will determine which field of the token will be changed
        if (arg === "p") {
          while (!valid) {
            token.phone = prompt("Enter your phone number: ");
            if (newTokenPhone(token.phone)) {
              valid = true;
            }
          }
        } else if (arg === "e") {
          while (!valid) {
            token.email = prompt("Enter your email address: ");
            if (newTokenEmail(token.email)) {
              valid = true;
            }
          }
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
        console.log("Token updated.");
      });
    }
  });
};

// Functions for logging a user in - used both in the CLI and the Web Server
const login = (username, tokenID) => {
  fs.readFile(tokenPath, (error, data) => {
    if (error) throw error;
    // if (DEBUG) console.log(JSON.parse(data));
    let tokens = JSON.parse(data);
    let match = false;
    let matchID = false;
    let updateToken = false;
    myEmitter.emit("cmd", "token.login()", "INFO", "Login attempted");

    tokens.forEach((token) => {
      if (token.username === username) {
        DEBUG && console.log("Step 1 complete - user found");
        match = true;

        if (token.token === tokenID) {
          DEBUG &&
            console.log("Step 2 complete - token entered matches user token");
          matchID = true;

          if (!checkDays(token.expires)) {
            DEBUG && console.log("Step 3 complete - token is not expired");
            console.log(`Token valid. Login complete. Welcome, ${username}.`);
            confirmToken(token);
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
            updateToken = true;
          }
        }
      }
    });
    loginOutput(updateToken, match, matchID);
  });
};

const confirmToken = (userToken) => {
  let userTokens = fs.readFileSync(tokenPath, "utf-8"); // Scan file, save list of users to this variable
  let tokens = JSON.parse(userTokens);
  let match = false;
  tokens.forEach((token) => {
    if (token.username === userToken.username) {
      if (token.token === userToken.token) {
        token.confirmed = true;
        match = true;
      } else console.log("Invalid TokenID");
    }
  });
  userTokens = JSON.stringify(tokens, null, 2);

  if (match) {
    // Read tokens.json file and replace existing list with new list
    fs.writeFile(tokenPath, userTokens, (err) => {
      if (err) throw err;
      DEBUG && console.log(userTokens);
      myEmitter.emit(
        "cmd",
        "token.confirmToken()",
        "INFO",
        "Token verified by user"
      );
      console.log("Token confirmed.");
    });
  }
};

const loginOutput = (updateToken, match, matchID) => {
  if (updateToken) {
    console.log("Expiry date updated. Please repeat login.");
  } else if (!match) {
    console.log("Invalid credentials. Username does not exist.");
  } else if (!matchID) {
    console.log("Invalid token ID. Please try again.");
  } else {
    myEmitter.emit("cmd", "token.login()", "INFO", "Login successful");
    console.log("Login successful.");
  }
};

module.exports = { tokenApp, newToken, checkDays, confirmToken };
