const Twit = require('twit');
const Tweet = require('./tweet');

class TwitterThreadFetcher {
  constructor(apiKey, apiSecret, accessToken, accessTokenSecret) {
    this.client = new Twit({
      consumer_key: apiKey,
      consumer_secret: apiSecret,
      access_token: accessToken,
      access_token_secret: accessTokenSecret
    });
  }

  async fetchThread(tweetID) {
    const tweets = [];

    while (tweetID) {
      const { data } = await this.client.get('statuses/lookup', {
        id: tweetID,
        tweet_mode: 'extended'
      });
      const tweet = new Tweet(data[0]);
      tweets.push(tweet);
      tweetID = tweet.inReplyToStatusID;
    }
    return tweets;
  }
}

module.exports = TwitterThreadFetcher;