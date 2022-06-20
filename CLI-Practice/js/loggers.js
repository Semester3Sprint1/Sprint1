const { format } = require("date-fns");
const { v4: uuid } = require("uuid");

const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

// var visitCount = 0;

const logTraffic = async (location, res) => {
  const dateTime = `${format(new Date(), "yyyy-MM-dd   HH:mm:ss")}`;

  switch (res.statusCode) {
    case 404:
      var status = "FILE NOT FOUND";
      break;
    case 410:
      var status = "GONE";
      break;
    case 418:
      var status = "I'M A TEAPOT";
      break;
    default:
      var status = "OK";
      break;
  }

  if (location !== "CSS") {
    const trafficItem = `${dateTime} \t ${
      res.statusCode
    } - ${status} \t ${location} page visited \t ${uuid()}\n`;
    DEBUG && console.log(trafficItem);
    try {
      if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
        await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
      }
      await fsPromises.appendFile(
        path.join(__dirname, "..", "logs", "trafficLog.txt"),
        trafficItem
      );
    } catch (err) {
      console.log(err);
    }
  }
};

const logCommand = async (level, event, message) => {
  const dateTime = `${format(new Date(), "yyyy-MM-dd   HH:mm:ss")}`;
  const logItem = `${dateTime}\t${level}\t\t${event}\t\t${message}\t\t${uuid()}\n`;
  DEBUG && console.log(logItem);
  try {
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
    }
    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", "commandLog.txt"),
      logItem
    );
  } catch (err) {
    console.log(err);
  }
};

const logTotal = async () => {
  const dateTime = `${format(new Date(), "yyyy-MM-dd   HH:mm:ss")}`;
  const totalItem = `${dateTime} \t Page visits since server open: ${visitCount}`;
  console.log(totalItem);
};

module.exports = { logTraffic, logTotal, logCommand };
