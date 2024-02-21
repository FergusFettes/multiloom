// Global variable to store the API key
var apiKey = "";

// Model configuration
var modelConfig = {
  model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
  max_tokens: 50,
  request_type: "language-model-inference",
  temperature: 0.7,
  top_p: 0.7,
  top_k: 50,
  repetition_penalty: 1,
  stream_tokens: false,
  stop: ["</s>"],
  n: 1,
};

// List of model aliases
var modelAliases = {
  "mistral-instruct": "mistralai/Mistral-7B-Instruct-v0.2",
  "mixtral-instruct": "mistralai/Mixtral-8x7B-Instruct-v0.1",
  mixtral: "mistralai/Mixtral-8x7B-v0.1",
  llama2: "togethercomputer/llama-2-70b",
  mistral: "mistralai/Mistral-7B-v0.1",
};

// Function to generate new output based on the given text and parent ID
function generateNewOutput(parentId) {
  const fullText = renderFullTextFromPatches(parentId);
  // Collect all selected models
  const selectedModels = Array.from(
    document.querySelectorAll(".model-checkbox:checked"),
  ).map((checkbox) => checkbox.value);
  // Determine the number of generations to perform
  const generations = modelConfig.n || 1;
  // Call the function to make an API call for text generation for each selected model
  selectedModels.forEach((modelAlias) => {
    for (let i = 0; i < generations; i++) {
      generateText(fullText, parentId, modelAlias);
    }
  });
}

// Function to make an API call for text generation
function generateText(fullText, parentId, type) {
  const config = Object.assign({}, modelConfig); // Clone the modelConfig object
  config.prompt = fullText;
  // type is the model alias. set the name
  config.model = modelAliases[type];
  // Remove the 'n' parameter as it's not supported by the axios call
  delete config.n;
  axios({
    method: "post",
    url: "https://api.together.xyz/v1/completions",
    data: config,
    headers: {
      Authorization: "Bearer " + apiKey,
    },
    responseType: "text",
  })
    .then((response) => {
      // Remove the "data:" prefix if it exists and parse the JSON
      const responseData = response.data.replace(/^data: /, "");
      const jsonResponse = JSON.parse(responseData);
      const newText = " " + jsonResponse.choices[0].text;

      // Create a new node with the generated text and the model type
      createNodeIfTextChanged(fullText, fullText + newText, parentId, type);
    })
    .catch((error) => {
      console.error("Error during API call:", error);
    });
}
