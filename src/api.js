// Global variable to store the API key
var apiKey = "";

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
      // Add a space if the text has more than 2 characters and doesn't start with punctuation
      // And the fullText doesnt end in a newline
      if (
        text.length > 2 &&
        !".!?".includes(text[0]) &&
        !fullText.endsWith("\n")
      ) {
        text = " " + text;
      }
      newText = text;

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
  // Trim literal spaces, not newlines
  text = text.replace(/ +$/, "").replace(/^ +/, "");

  const lastChar = text[text.length - 1];
  punctuation = ".!?}]);:,";
  if (punctuation.includes(lastChar)) {
    return text;
  }
  const lastSpace = text.lastIndexOf(" ");

  return text.slice(0, lastSpace);
}