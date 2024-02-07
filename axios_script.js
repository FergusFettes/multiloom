axios.post('https://api.together.xyz/v1/completions', {
  "model": "mistralai/Mixtral-8x7B-Instruct-v0.1",
  "max_tokens": 50,
  "prompt": "just say the word 'hello' and nothing else",
  "request_type": "language-model-inference",
  "temperature": 0.7,
  "top_p": 0.7,
  "top_k": 50,
  "repetition_penalty": 1,
  "stream_tokens": true,
  "stop": [
    "</s>"
  ]
}, {
  headers: {
    Authorization: 'Bearer ' + apiKey
  },
  responseType: "text"
}).then((response) => {
    const output = response.data
      .trim()
      .split('\n')
      .map(line => {
        try {
          return JSON.parse(line.substring(6));
        } catch (error) {
          console.error('Error parsing line:', line, error);
        }
      })
      .filter(Boolean)
      .map(parsedLine => parsedLine.choices[0].text)
      .join('');
    console.log('Generated text:', output);
}, (error) => {
  console.log(error);
});
