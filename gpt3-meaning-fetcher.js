const { Configuration, OpenAIApi } = require("openai");

class GPT3MeaningFetcher {
  constructor(apiKey) {
    this.configuration = new Configuration({ apiKey });
    this.openai = new OpenAIApi(this.configuration);
  }

  async getMeaning(inputText) {
    // Use the OpenAI API to generate a response based on the input text
    const response = await this.openai.createCompletion({
      model: "text-davinci-003",
      prompt: inputText,
	  temperature: 0.7,
	  max_tokens: 60,
	  top_p: 1,
	  frequency_penalty: 0,
	  presence_penalty: 1,
    })

    const completion = response.data.completion;
    const message = response.data.choices[0].text;
    return message.length > 0 ? message : "Error! No message returned";
  }
}

module.exports = GPT3MeaningFetcher;