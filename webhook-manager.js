const { response } = require("express");
const request = require("request-promise");
require("dotenv").config();

class WebhookManager {
  constructor() {
    this.auth = {
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      token: process.env.TWITTER_ACCESS_TOKEN,
      token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    };
    this.env = process.env.TWITTER_WEBHOOK_ENV;
  }

  createWebhook() {
    this.deleteWebhookIfNeeded();
    console.log("Creating web hook");

    // request options
    var request_options = {
      url:
        "https://api.twitter.com/1.1/account_activity/all/" +
        this.env +
        "/webhooks.json",
      oauth: this.auth,
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
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
        console.log('Successfully created webhook!');
        console.log(body);
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  getWebhook(callback) {
    var request_options = {
      url:
        "https://api.twitter.com/1.1/account_activity/all/" +
        this.env +
        "/webhooks.json",
      oauth: this.auth,
    };

    // GET request to retreive webhook config
    request
      .get(request_options)
      .then(function (body) {
        if (body == '[]') {
          console.log("No exisiting webhooks found");
          return;
        }
        console.log("Found Webhook: " + body);
        if (callback) {
          callback(body);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  deleteWebhookIfNeeded() {
    this.getWebhook((response) => {
      var webhook_id = JSON.parse(response)[0].id;
      console.log("Deleting webhook config:", webhook_id);

      var request_options = {
        url:
          "https://api.twitter.com/1.1/account_activity/all/" +
          this.env +
          "/webhooks/" +
          webhook_id +
          ".json",
        oauth: this.auth,
        resolveWithFullResponse: true,
      };
      return request.delete(request_options);
    });
  }
}

module.exports = WebhookManager;
