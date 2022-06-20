let initText = `
app init <command>

Usage:

app init --all          creates the folder structure and config file
app init --mk           creates the folder structure and add usage files
app init --cat          creates the config file with default settings
app init --tkn          creates the token file
`;

let configText = `
app config <command>

Usage:

app config --show                     displays a list of the current config settings
app config --reset                    resets the config file with default settings
app config --set <attribute> <value>  sets a specific config setting
app config --add <attribute> <value>  adds an attribute to the config file
`;

let tokenText = `
app config <command>

Usage:

app token --count                     displays a count of the tokens created
app token --new <username>            generates a token for a given username, saves tokens to the json file
app token --add p <username> <phone>
app token --add e <username> <email>
app token --search u <username>       fetches a token for a given username
app token --search e <email>          fetches a token for a given email
app token --search p <phone>          fetches a token for a given phone number
app token --expired                   checks for expired tokens
app token --login <username>          attempts to log a user in - checks their token as they do so`;

const configJson = {
  name: "AppConfigCLI",
  version: "1.0.0",
  description: "The Command Line Interface (CLI) for the App.",
  main: "app.js",
  superuser: "adm1n",
};

// let defaultToken = [
//   {
//     created: "1969-01-31 12:30:00",
//     username: "username",
//     email: "user@example.com",
//     phone: "7096548900",
//     token: "token",
//     expires: "1969-02-03 12:30:00",
//     confirmed: "tbd",
//   },
// ];

let defaultToken = [];

module.exports = {
  initText,
  configText,
  configJson,
  defaultToken,
  tokenText,
};
