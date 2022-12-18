const Twit = require("twit");

class TwitterBot {
  constructor(apiKey, apiSecret, accessToken, accessTokenSecret) {
    this.client = new Twit({
      consumer_key: apiKey,
      consumer_secret: apiSecret,
      access_token: accessToken,
      access_token_secret: accessTokenSecret,
    });
  }

  tweet(status) {
    return new Promise((resolve, reject) => {
      this.client.post("statuses/update", { status }, (err, data, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  sendDM(recipient, text) {
    // Look up the user's ID using their screen name
    // const { data: user } = await this.client.get("users/show", {
    //   screen_name: recipient,
    // });
    // const participantId = user.id_str;
    
    this.client.post('direct_messages/new', {
      screen_name: 'recipient',
      text: 'Hello, this is a test direct message'
    }, (error, data, response) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Direct message sent successfully');
      }
    });
}
}

module.exports = TwitterBot;
