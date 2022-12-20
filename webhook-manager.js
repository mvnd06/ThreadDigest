const request = require("request-promise");
require("dotenv").config();

class WebhookManager {
  constructor() {

  }

  createWebhook() {
    console.log('creating web hook');
    const twitter_oauth = {
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        token: process.env.TWITTER_ACCESS_TOKEN,
        token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    }
    // request options
    var request_options = {
      url: "https://api.twitter.com/1.1/account_activity/webhooks.json",
      oauth: twitter_oauth,
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
      form: {
        url: "https://dm-genie.herokuapp.com/webhook/twitter",
      },
    };

    // POST request to create webhook config
    request
      .post(request_options)
      .then(function (body) {
        console.log(body);
      })
      .catch(function (body) {
        console.error(body);
      });
  }
}
 
module.exports = WebhookManager;