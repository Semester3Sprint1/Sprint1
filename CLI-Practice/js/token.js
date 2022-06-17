const crc32 = require("crc/crc32");
// const { format } = require("date-fns");

const fs = require("fs");
const path = require("path");
const { defaultToken } = require("./templates");
const tokenPath = path.join(__dirname, "..", "tokens.json");
const prompt = require("prompt-sync")({ sigint: true });

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
      if (searchTarget === element) {
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
    if (DEBUG) console.log("Counting tokens");
    let tokens = JSON.parse(data);
    let tokenCount = tokens.length;
    console.log(`Number of tokens: ${tokenCount}`);
  });
};

const editDetail = (arg, username, element) => {
  DEBUG && console.log("--- SET PHONE NUMBER ---");
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
    }

    data = JSON.stringify(tokens, null, 2);
    fs.writeFile(tokenPath, data, (error) => {
      if (error) throw error;
      DEBUG && console.log("Changed tokens.json file to reflect updates");
    });
  });
};

const newToken = (username) => {
  let crc = crc32(username).toString(16);

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
  newToken.username = username;
  newToken.email = prompt("Enter your email: ");
  newToken.phone = prompt("Enter your phone number: ");
  newToken.token = crc;
  newToken.expires = expires.toLocaleDateString();

  let userTokens = fs.readFileSync(tokenPath, "utf-8"); // Scan file, save list of users to this variable
  let tokens = JSON.parse(userTokens);
  tokens.push(newToken);
  userTokens = JSON.stringify(tokens, null, 2);

  // This stuff is unnecessary ------------

  // console.log(tokens);
  // console.log("AS JSON:");
  // console.log(tokens);
  // console.log("AS STRING:");
  // console.log(userTokens);
  // -----------------------------------------

  // Read tokens.json file and replace existing list with new list
  fs.writeFile(tokenPath, userTokens, (err) => {
    if (err) throw err;
    DEBUG && console.log(userTokens);
    DEBUG && console.log("Updated token file");
  });
};

module.exports = { tokenApp };
