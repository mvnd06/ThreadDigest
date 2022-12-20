//1601833608708325376

require("dotenv").config();
const express = require("express");
const app = express();
const security = require("./security");
const request = require("request-promise");

const TwitterThreadFetcher = require("./twitter-thread-fetcher");
const GPT3Fetcher = require("./gpt3-fetcher");
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
      processDMEvent(request.body.direct_message_events)
    }
  }
});

// Direct Messages

async function processDMEvent(event) {
  const {messageText: message, senderId: sender} = getMessageAndSender(event);
  console.log('Received "' + message + '" from: ' + sender);

  const gpt3Fetcher = new GPT3Fetcher(openAIKey);
  const replyText = await gpt3Fetcher.getReply(message);
  const reply = generateMessageObject(replyText, sender);
  sendMessage(reply);
}

function getMessageAndSender(events) {
  if (!events || events.length < 0) {
    return;
  }
  const messageEvent = events[0];
  const senderId = messageEvent.message_create.sender_id;
  const messageText = messageEvent.message_create.message_data.text;
  return { messageText, senderId };
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

function sendWelcomeMessage(text) {

  const message = {
    welcome_message: {
      name: 'welcome message',
      message_data: {
        text: text
      }
    }
  }

  var request_options = {
    url: 'https://api.twitter.com/1.1/direct_messages/welcome_messages/new.json',
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
    body: message
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

    const meaningFetcher = new GPT3Fetcher(openAIKey);
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
