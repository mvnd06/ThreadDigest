class Tweet {
  constructor(data) {
    this.inReplyToStatusID = data.in_reply_to_status_id_str;
    this.fullText = data.full_text;
  }
}

module.exports = Tweet;
