const { Configuration, OpenAIApi } = require("openai");

class GPT3Fetcher {
  constructor(apiKey) {
    this.configuration = new Configuration({ apiKey });
    this.openai = new OpenAIApi(this.configuration);
  }

  async getReply(inputText) {
    // Use the OpenAI API to generate a response based on the input text
    const response = await this.openai.createCompletion({
      model: "text-davinci-003",
      prompt: inputText,
	  temperature: 0.9,
	  max_tokens: 150,
	  top_p: 1,
	  frequency_penalty: 0.0,
	  presence_penalty: 0.6,
    stop: [" Human:", " AI:"],
    })

    const completion = response.data.completion;
    const message = response.data.choices[0].text;
    return message.length > 0 ? message : "Error! No message returned";
  }
}

module.exports = GPT3Fetcher;