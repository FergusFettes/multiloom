// Function to generate new output based on the given text and parent ID
function generateNewOutput(parentId) {
  const fullText = renderFullTextFromPatches(parentId);
  // Collect all active models and their configurations
  const activeModels = Array.from(
    document.querySelectorAll(".model-enable-checkbox:checked"),
  ).map((checkbox) => {
    const modelName = checkbox.id.replace("enable-", "");
    const isPinnedToDefault = document.getElementById(
      `pin-default-${modelName}`,
    ).checked;
    const modelConfigElement = document.getElementById(
      `model-config-${modelName}`,
    );
    const customModelConfig = isPinnedToDefault
      ? modelConfig
      : {
          max_tokens: parseInt(
            modelConfigElement.querySelector(`#max-tokens-input-${modelName}`)
              .value,
          ),
          temperature: parseFloat(
            modelConfigElement.querySelector(`#temperature-input-${modelName}`)
              .value,
          ),
          top_p: parseFloat(
            modelConfigElement.querySelector(`#top-p-input-${modelName}`).value,
          ),
          top_k: parseInt(
            modelConfigElement.querySelector(`#top-k-input-${modelName}`).value,
          ),
          repetition_penalty: parseFloat(
            modelConfigElement.querySelector(
              `#repetition-penalty-input-${modelName}`,
            ).value,
          ),
          stop: modelConfigElement
            .querySelector(`#stop-sequence-input-${modelName}`)
            .value.split(", "),
          n: parseInt(
            modelConfigElement.querySelector(`#completions-input-${modelName}`)
              .value,
          ),
        };
    return {
      model: modelName,
      config: customModelConfig,
    };
  });

  // Determine the number of generations to perform
  const generations = modelConfig.n || 1;
  // Call the function to make an API call for text generation for each active model
  activeModels.forEach((model) => {
    for (let i = 0; i < generations; i++) {
      generateText(fullText, parentId, model.model, model.config);
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
function generateText(fullText, parentId, modelName, customConfig) {
  // Use custom config if provided, else clone the default modelConfig object
  var config = customConfig || Object.assign({}, modelConfig);
  var apiUrl = modelUrl[modelName];

  config.prompt = fullText;
  config.model = remoteName[modelName];

  let headers = {
    Authorization: "Bearer " + togetherApiKey,
  };

  // Check if the model is for OpenAI and set the appropriate API URL and headers
  if (modelName.startsWith("gpt")) {
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
      max_tokens: config.max_tokens,
      temperature: config.temperature,
      top_p: config.top_p,
      stop: config.stop,
      model: remoteName[modelName],
    };
  }

  // Check if the model is for Mistral and set the appropriate API URL and headers
  if (modelName.includes("mistral-large")) {
    headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + mistralApiKey,
    };
    config = {
      messages: [
        {
          role: "user",
          content: fullText,
        },
      ],
      temperature: config.temperature,
      top_p: config.top_p,
      max_tokens: config.max_tokens,
      model: remoteName[modelName],
    };
  }

  // Check if the model is for Google's Gemini and set the appropriate API URL and headers
  if (modelName.includes("gemini")) {
    headers = {
      "Content-Type": "application/json",
    };
    apiUrl = `${apiUrl}/${modelName}:generateContent?key=${googleApiKey}`;
    config = {
      contents: [
        {
          parts: [{ text: fullText }],
        },
      ],
      generationConfig: {
        stopSequences: config.stop,
        temperature: config.temperature,
        maxOutputTokens: config.max_tokens,
        topP: config.top_p,
        topK: config.top_k,
      },
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
      // Process the response and create a new node with the generated text
      const newText = processApiResponse(fullText, response, modelName);
      createNodeIfTextChanged(
        fullText,
        fullText + newText,
        parentId,
        modelName,
      );
    })
    .catch((error) => {
      console.error("Error during API call:", error);
    });
}

function processApiResponse(fullText, response, modelName) {
  // Remove the "data:" prefix if it exists and parse the JSON
  const responseData = response.data.replace(/^data: /, "");
  const jsonResponse = JSON.parse(responseData);
  var newText = "";
  if (modelName.includes("gemini")) {
    // Google's Gemini returns the response in a different format
    newText = healTokens(
      jsonResponse.candidates[0].content.parts
        .map((part) => part.text)
        .join(""),
    );
  } else if (modelName.includes("mistral-large")) {
    // Mistral returns the response in a different format
    newText = healTokens(jsonResponse[0].content);
  } else if (modelName.startsWith("gpt")) {
    // OpenAI returns the response in a different format
    newText = healTokens(jsonResponse.choices[0].message.content);
  } else {
    newText = healTokens(jsonResponse.choices[0].text);
  }
  // Add a space if the text has more than 2 characters and doesn't start with punctuation
  // And the fullText doesn't end in a newline
  if (
    newText.length > 2 &&
    !".!?".includes(newText[0]) &&
    !fullText.endsWith("\n")
  ) {
    newText = " " + newText;
  }
  return newText;
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
