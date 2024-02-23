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
  gpt3t: "gpt-3.5-turbo",
  gpt4t: "gpt-4-turbo-preview",
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

const prePrompt = `Return to completion mode. Complete the given sentence as best you can, with no commentary.
Return only the completion. If the prompt requires creativity, be creative.
DO NOT SAY 'here are some possible completions'. Just return the completion.

Examples:
Prompt:
The quick brown fox
Completion: jumps over the lazy dog.
Prompt:
The capital of France is
Completion: Paris.

Prompt:
`;

// Function to make an API call for text generation
function generateText(fullText, parentId, type) {
  var config = Object.assign({}, modelConfig); // Clone the modelConfig object
  // Strip a space from the end of fullText if it exists
  config.prompt = fullText;
  // type is the model alias. set the name
  config.model = modelAliases[type];

  let apiUrl = "https://api.together.xyz/v1/completions";
  let headers = {
    Authorization: "Bearer " + togetherApiKey,
  };

  // Check if the model alias is for OpenAI and set the appropriate API URL and headers
  if (type.startsWith("gpt")) {
    apiUrl = "https://api.openai.com/v1/chat/completions";
    headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + openaiApiKey,
    };
    // OpenAI expects the prompt in a different format
    config = {
      messages: [
        {
          role: "user",
          content: prePrompt + fullText,
        },
      ],
      max_tokens: modelConfig.max_tokens,
      temperature: modelConfig.temperature,
      top_p: modelConfig.top_p,
      n: modelConfig.n,
      stop: modelConfig.stop,
      model: modelAliases[type],
    };
  }

  // Remove the 'n' parameter as it's not supported by the axios call
  delete config.n;
  axios({
    method: "post",
    url: apiUrl,
    data: config,
    headers: headers,
    responseType: "text",
  })
    .then((response) => {
      // Remove the "data:" prefix if it exists and parse the JSON
      const responseData = response.data.replace(/^data: /, "");
      const jsonResponse = JSON.parse(responseData);
      var newText = "";
      if (type.startsWith("gpt")) {
        // OpenAI returns the response in a different format
        text = healTokens(jsonResponse.choices[0].message.content);
      } else {
        text = healTokens(jsonResponse.choices[0].text);
      }
      // Add a space
      newText = " " + text;

      // Create a new node with the generated text and the model type
      createNodeIfTextChanged(fullText, fullText + newText, parentId, type);
    })
    .catch((error) => {
      console.error("Error during API call:", error);
    });
}

// Token Healing: Eventually I want to add good token healing support. For now, we will just check if the last character is punctuation. If not, we will back up to the last space.
// We also strip any spaces at the start of the text.
function healTokens(text) {
  text = text.trim();

  const lastChar = text[text.length - 1];
  punctuation = ".!?}]);:,";
  if (punctuation.includes(lastChar)) {
    return text;
  }
  const lastSpace = text.lastIndexOf(" ");
  // Strip spaces at the start and end of the text

  return text.slice(0, lastSpace);
}
