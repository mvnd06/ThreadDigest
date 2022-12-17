const Twitter = require("twitter");

class TwitterBot {
  constructor(apiKey, apiSecret, accessToken, accessTokenSecret) {
    this.client = new Twitter({
      consumer_key: apiKey,
      consumer_secret: apiSecret,
      access_token_key: accessToken,
      access_token_secret: accessTokenSecret,
    });
  }

  tweet(message) {
    this.client.post(
      "statuses/update",
      { status: message },
      (error, tweet, response) => {
        if (error) {
          console.error(error);
        } else {
          console.log(`Tweeted: "${message}"`);
        }
      }
    );
  }
}

module.exports = TwitterBot;
