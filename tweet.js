class Tweet {
  constructor(data) {
    this.inReplyToStatusID = data.in_reply_to_status_id_str;
    this.fullText = data.full_text;
    // this.createdAt = data.created_at;
    // this.id = data.id;
    // this.idStr = data.id_str;
    // this.fullText = tdata.full_text;
    // this.truncated = data.truncated;
    // this.displayTextRange = data.display_text_range;
    // this.entities = data.entities;
    // this.source = dat.source;
    // ...add other properties as needed
  }
}

module.exports = Tweet;
