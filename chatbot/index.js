'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
var atob = require('atob');

// create LINE SDK config from env variables
const config = {
  channelAccessToken: "YOUR_ACCESS_TOKEN",
  channelSecret: "YOUR_SECRET",
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

function base64ToHex(str) {
  for (var i = 0, bin = atob(str.replace(/[ \r\n]+$/, "")), hex = []; i < bin.length; ++i) {
      let tmp = bin.charCodeAt(i).toString(16);
      if (tmp.length === 1) tmp = "0" + tmp;
      hex[hex.length] = tmp;
  }
  return hex.join(" ");
}

// event handler
function handleEvent(event) {
  // console.log(event)
  if (event.type !== 'things') {
    // ignore non-things event
    return Promise.resolve(null);
  }

  var echo;

  if (event.type == 'things') {
    if (event.things.type !== "scenarioResult") {
      return Promise.resolve(null);
    }
    if (event.things.result.resultCode !== "success") {
      console.log("Error Result: " + event)
    }

    if (event.things.result.bleNotificationPayload == undefined) {
      echo = { type: 'text', text: "Device Connected" };
    }
    else
      var button_state = parseInt(base64ToHex(event.things.result.bleNotificationPayload), 16);
      if (button_state > 1) {
        echo = { type: 'text', text: "You have pressed the button " + button_state + " times" };
      }
      else if (button_state > 0) {
        echo = { type: 'text', text: "You have pressed the button " + button_state + " time" };
      }
  }
  else {
    echo = { type: 'text', text: "Something went wrong" };
  }

  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});