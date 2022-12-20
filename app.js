//1601833608708325376

require("dotenv").config();
const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");
const security = require("./security");
const request = require("request-promise");

const TwitterThreadFetcher = require("./twitter-thread-fetcher");
const GPT3MeaningFetcher = require("./gpt3-meaning-fetcher");
const TwitterBot = require("./twitter-bot");
const WebhookManager = require("./webhook-manager.js");

const apiKey = process.env.TWITTER_CONSUMER_KEY;
const apiSecret = process.env.TWITTER_CONSUMER_SECRET;
const accessToken = process.env.TWITTER_ACCESS_TOKEN;
const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;
const openAIKey = process.env.OPEN_AI_API_KEY;

// Configure parsing
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const jsonParser = bodyParser.json();
app.use(jsonParser);

// Load Initial HTML and CSS

// Set the view engine to ejs
app.set("view engine", "ejs");

// Serve static files from the 'public' directory
app.use(express.static(__dirname + "../public"));

// Handle requests for the '/style.css' route
app.get("/style.css", (req, res) => {
  fs.readFile(__dirname + "/style.css", (err, data) => {
    if (err) throw err;
    res.setHeader("Content-Type", "text/css");
    res.send(data);
  });
});

// Handle requests for the '/' route
app.get("/", (req, res) => {
  res.render("index", { tweets: [], message: "" });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`[Server listening on port ${port}]\n`);
});

// Create webhooks
const manager = WebhookManager.getManager();
manager.createWebhook();

// Receives challenges from CRC check + updates to data
app.all("/webhook/twitter", function (request, response) {
  var crc_token = request.query.crc_token;
  if (crc_token) {
    var hash = security.get_challenge_response(crc_token, apiSecret);
    response.status(200);
    response.send({
      response_token: "sha256=" + hash,
    });
  } else {
    response.sendStatus(200);
    if (request.body.direct_message_events) {
      const [msg, sender] = getMessageAndSender(request.body.direct_message_events);
      console.log('Received "' + msg + '" from: ' + sender);
      const message = generateMessageObject(msg, sender);
      sendMessage(message);
    }
  }
});

// Direct Messages

function getMessageAndSender(events) {
  if (!events || events.length < 0) {
    return;
  }
  console.log(events);
  const messageEvent = events[0];
  const senderId = messageEvent.message_create.sender_id;
  const messageText = messageEvent.message_create.message_data.text;
  return messageText, senderId;
}

function generateMessageObject(text, recipientId) {
  return {
    event: {
      type: 'message_create',
      message_create: {
        target: {
          recipient_id: recipientId
        },
        message_data: {
          text: text
        }
      }
    }
  };
}

function sendMessage(body) {
  var request_options = {
    url: 'https://api.twitter.com/1.1/direct_messages/events/new.json',
    oauth: {
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      token: process.env.TWITTER_ACCESS_TOKEN,
      token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    },
    json: true,
    headers: {
      'content-type': 'application/json'
    },
    body: body
  }
  
  // POST request to send Direct Message
  request.post(request_options, function (error, response, body) {
    console.log(body)
  })
}

// Fetch Thread

app.post("/fetch-thread", urlencodedParser, async (req, res) => {
  const threadFetcher = new TwitterThreadFetcher(
    apiKey,
    apiSecret,
    accessToken,
    accessTokenSecret
  );

  try {
    const threadId = req.body.threadId;
    const thread = await threadFetcher.fetchThread(threadId);

    const meaningFetcher = new GPT3MeaningFetcher(openAIKey);
    const inputText = combineTweets(thread);
    const meaning = await meaningFetcher.getMeaning(inputText);
    res.render("index", { tweets: thread, message: meaning });

    const bot = new TwitterBot(
      apiKey,
      apiSecret,
      accessToken,
      accessTokenSecret
    );

    bot.sendDM("@mvnd06", meaning);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching the thread");
  }
});

function combineTweets(tweets) {
  return (text =
    tweets
      .reverse()
      .map((element) => element.fullText)
      .join("") + " Tl;dr");
}
