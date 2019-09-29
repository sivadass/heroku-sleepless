const express = require("express");
const fs = require("fs");
const path = require("path");
const request = require("request");
const cron = require("node-cron");
const { PORT, URL, TIMEZONE } = require("./config");

const app = express();

function logData(value = "NO DATA RECEIVED!") {
  const file = "log-data.json";
  fs.readFile(file, (err, data) => {
    if (err && err.code === "ENOENT") {
      return fs.writeFile(file, JSON.stringify([value]), err =>
        console.error(err)
      );
    } else if (err) {
      console.error(err);
    } else {
      try {
        const fileData = JSON.parse(data.toString());
        fileData.push(value);
        fs.writeFile(file, JSON.stringify(fileData), err => {
          if (err) throw err;
        });
      } catch (exception) {
        console.error(exception);
      }
    }
  });
}

const ping = cron.schedule(
  "*/29 5-22 * * *",
  function() {
    request(URL, function(error, response) {
      const data = {
        time: new Date().toLocaleString(),
        code: response ? response.statusCode : "OOOPS!",
        error: JSON.stringify(error, null, 2)
      };
      logData(data);
    });
  },
  {
    scheduled: false,
    timezone: TIMEZONE
  }
);

// start the cron job
ping.start();

app.get("/", function(req, res) {
  res.header("Content-Type", "application/json");
  res.sendFile(path.join(__dirname, "log-data.json"));
  // res.send("App is running bitch!");
});

app.listen(process.env.PORT || PORT, () =>
  console.log("🌍  ==> Heroku Sleepless Pinger is On 🔥")
);
