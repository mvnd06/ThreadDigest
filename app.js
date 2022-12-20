//1601833608708325376

const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const security = require('./security')

const TwitterThreadFetcher = require("./twitter-thread-fetcher");
const GPT3MeaningFetcher = require("./gpt3-meaning-fetcher");
const TwitterBot = require("./twitter-bot");

const WebhookManager = require("./webhook-manager.js")

const { Autohook } = require('twitter-autohook');

const apiKey = process.env.TWITTER_CONSUMER_KEY;
const apiSecret = process.env.TWITTER_CONSUMER_SECRET;
const accessToken = process.env.TWITTER_ACCESS_TOKEN;
const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;
const openAIKey = process.env.OPEN_AI_API_KEY;

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
const manager = WebhookManager.getManager()
manager.createWebhook();
manager.addSubscription();

// Receives challenges from CRC check
app.all('/webhook/twitter', function(request, response) {
  var crc_token = request.query.crc_token
  if (crc_token) {
    var hash = security.get_challenge_response(crc_token, apiSecret)
    response.status(200);
    response.send({
      response_token: 'sha256=' + hash
    })
  } else {
    response.sendStatus(200);
    console.log('Received a webhook event:', request.body);
  }
})


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
 
    bot.sendDM("@mvnd06", meaning)
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