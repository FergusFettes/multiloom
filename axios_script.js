axios({
  method: 'post',
  url: 'https://api.together.xyz/v1/completions',
  data: {
    "model": "mistralai/Mixtral-8x7B-Instruct-v0.1",
    "max_tokens": 50,
    "prompt": "just say the word 'hello' and nothing else",
    "request_type": "language-model-inference",
    "temperature": 0.7,
    "top_p": 0.7,
    "top_k": 50,
    "repetition_penalty": 1,
    "stream_tokens": false,
    "stop": ["</s>"]
  },
  headers: {
    Authorization: 'Bearer ' + apiKey
  },
  responseType: 'text',
}).then((response) => {
  // Remove the "data:" prefix if it exists and parse the JSON
  const responseData = response.data.replace(/^data: /, '');
  const jsonResponse = JSON.parse(responseData);
  const fullText = jsonResponse.choices[0].text;
  console.log('Full text received:', fullText);
}).catch((error) => {
  console.error('Error during API call:', error);
});
