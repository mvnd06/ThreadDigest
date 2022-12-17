const express = require('express');
const ejs = require('ejs');
const app = express();
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });

const TwitterThreadFetcher = require('./twitter-thread-fetcher');
const GPT3MeaningFetcher = require('./gpt3-meaning-fetcher');

// Load Initial HTML and CSS

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Serve static files from the 'public' directory
app.use(express.static(__dirname + '../public'));

// Handle requests for the '/style.css' route
app.get('/style.css', (req, res) => {
  fs.readFile(__dirname + '/style.css', (err, data) => {
    if (err) throw err;
    res.setHeader('Content-Type', 'text/css');
    res.send(data);
  });
});

// Handle requests for the '/' route
app.get('/', (req, res) => {
  res.render('index', { tweets: [], message: '' });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Fetch Thread

app.post('/fetch-thread', urlencodedParser, async (req, res) => {
  const apiKey = "hZbYcIput6IOXoGP5bYuhS34b";
  const apiSecret = "mxBW2050mT120KDr8AdkpKlqYkNzZ4bbud1xZn9Ct9MDQxlUPC";
  const accessToken = "1437080523168358412-43CqCp7OKw2OVlPiMbEodk8Awd5N37";
  const accessTokenSecret = "7fH7W7vEQmdhlyr96gtCU3rRLBXGFk6MExnJlr6m0S0rR";

  const openAIKey = "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";

  const threadFetcher = new TwitterThreadFetcher(apiKey, apiSecret, accessToken, accessTokenSecret);  

  try {
    const threadId = req.body.threadId;
    const thread = await threadFetcher.fetchThread(threadId);

    const meaningFetcher = new GPT3MeaningFetcher(openAIKey);
    const inputText = combineTweets(thread);
    const meaning = await meaningFetcher.getMeaning(inputText);
    res.render('index', { tweets: thread, message: meaning });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching the thread');
  }
});

function combineTweets(tweets) {
  return text = tweets.reverse().map(element => element.fullText).join('');
}