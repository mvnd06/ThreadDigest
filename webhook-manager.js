const request = require("request-promise");
require("dotenv").config();

class WebhookManager {
  constructor() {}

  createWebhook() {
    console.log("creating web hook");
    const twitter_oauth = {
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      token: process.env.TWITTER_ACCESS_TOKEN,
      token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    };

    const authorization = this.generateAuthorizationString(process.env.TWITTER_CONSUMER_KEY, process.env.TWITTER_ACCESS_TOKEN);
    // request options
    var request_options = {
      url: 'https://api.twitter.com/1.1/account_activity/all/' + process.env.TWITTER_WEBHOOK_ENV + '/webhooks.json',
      oauth: twitter_oauth,
      headers: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      json: true,
      form: {
        url: "https://dm-genie.herokuapp.com/webhook/twitter",
      },
    };

    // POST request to create webhook config
    request
      .post(request_options)
      .then(function (body) {
        console.log("test");
        console.log(body);
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  generateAuthorizationString(consumerKey, accessToken) {
    return `OAuth oauth_consumer_key="${consumerKey}", 
    oauth_nonce="GENERATED", oauth_signature="GENERATED", 
    oauth_signature_method="HMAC-SHA1", oauth_timestamp="GENERATED", 
    oauth_token="${accessToken}", oauth_version="1.0"`;
  }
}

module.exports = WebhookManager;
