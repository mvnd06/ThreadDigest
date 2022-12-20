const { response } = require("express");
const request = require("request-promise");
require("dotenv").config();

class WebhookManager {

  static manager;

  static getManager() {
    if (!WebhookManager.manager) {
      WebhookManager.manager = new WebhookManager();
    }
    return WebhookManager.manager;
  }

  constructor() {
    this.auth = {
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      token: process.env.TWITTER_ACCESS_TOKEN,
      token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    };
    this.env = process.env.TWITTER_WEBHOOK_ENV;
    this.id = null;
  }

  createWebhook() {
    this.deleteWebhookIfNeeded();
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
    this.id = request
      .post(request_options)
      .then(function (body) {
        console.log('Successfully created webhook: ' + body.id);
        return body.id;
      })
      .catch(function (error) {
        console.error(error);
        return null;
      });
  }

  getWebhook(callback) {
    if (this.id) {
      console.log("No request needed, found: " + this.id);
      if (callback) {
        callback(this.id);
      }
      return this.id;
    }

    var request_options = {
      url:
        "https://api.twitter.com/1.1/account_activity/all/" +
        this.env +
        "/webhooks.json",
      oauth: this.auth,
    };

    // GET request to retreive webhook config
    this.id = request
      .get(request_options)
      .then(function (body) {
        if (body == '[]') {
          console.log("No exisiting webhooks found");
          return null;
        }
        const id = JSON.parse(body)[0].id;
        console.log("Found webhook: " + id);
        if (callback) {
          callback(id);
        }
        return id;
      })
      .catch(function (error) {
        console.log(error);
        return null;
      });
  }

  deleteWebhookIfNeeded() {
    this.getWebhook((webhook_id) => {  
      console.log("Deleting webhook:", webhook_id);

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
