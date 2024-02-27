const models = [
  "google/gemma-7b@https://api.together.xyz/v1/completions",
  "mistralai/Mistral-7B-Instruct-v0.2@https://api.together.xyz/v1/completions",
  "mistralai/Mixtral-8x7B-Instruct-v0.1@https://api.together.xyz/v1/completions",
  "mistralai/Mixtral-8x7B-v0.1@https://api.together.xyz/v1/completions",
  "togethercomputer/llama-2-70b@https://api.together.xyz/v1/completions",
  "mistralai/Mistral-7B-v0.1@https://api.together.xyz/v1/completions",
  "gpt-3.5-turbo@https://api.openai.com/v1/chat/completions",
  "gpt-4-turbo-preview@https://api.openai.com/v1/chat/completions",
];

// Model configuration
var modelConfig = {
  model: "",
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
  gemma: "gpt-4-turbo-preview",
};

function createModelConfigElement(modelName, isDefault = false) {
  const configSection = document.createElement("div");
  configSection.className = "model-config-blob";
  configSection.id = `model-config-${sanitizeModelName(modelName)}`;
  configSection.innerHTML = `
            <h3>${modelName}
            ${isDefault ? "" : `<input type="checkbox" class="model-enable-checkbox" id="enable-${sanitizeModelName(modelName)}" checked>`}
            </h3>
            <div class="model-config-fields">
            <label for="max-tokens-input-${sanitizeModelName(modelName)}">Max Tokens:</label>
            <input type="number" id="max-tokens-input-${sanitizeModelName(modelName)}" value="${modelConfig.max_tokens}" step="10"><br>
            <label for="temperature-input-${sanitizeModelName(modelName)}">Temperature:</label>
            <input type="number" step="0.1" id="temperature-input-${sanitizeModelName(modelName)}" value="${modelConfig.temperature}"><br>
            <label for="top-p-input-${sanitizeModelName(modelName)}">Top P:</label>
            <input type="number" step="0.1" id="top-p-input-${sanitizeModelName(modelName)}" value="${modelConfig.top_p}"><br>
            <label for="top-k-input-${sanitizeModelName(modelName)}">Top K:</label>
            <input type="number" id="top-k-input-${sanitizeModelName(modelName)}" value="${modelConfig.top_k}"><br>
            <label for="repetition-penalty-input-${sanitizeModelName(modelName)}">Repetition Penalty:</label>
            <input type="number" step="0.1" id="repetition-penalty-input-${sanitizeModelName(modelName)}" value="${modelConfig.repetition_penalty}"><br>
            <label for="stop-sequence-input-${sanitizeModelName(modelName)}">Stop Sequence:</label>
            <input type="text" id="stop-sequence-input-${sanitizeModelName(modelName)}" value="${modelConfig.stop.join(", ")}"><br>
            <label for="completions-input-${sanitizeModelName(modelName)}">Completions:</label>
            <input type="number" id="completions-input-${sanitizeModelName(modelName)}" value="${modelConfig.n}"><br>
            ${isDefault ? "" : `<label for="pin-default-${sanitizeModelName(modelName)}">Pin to Default:</label>
            <input type="checkbox" id="pin-default-${sanitizeModelName(modelName)}" checked>`}
        </div>
    `;
  return configSection;
}

function sanitizeModelName(modelName) {
  return modelName.replace(/[^a-zA-Z0-9]/g, "");
}


window.addEventListener("DOMContentLoaded", function() {
  const modelConfigContainer = document.getElementById("model-params-container");
  models.forEach((model) => {
    const [modelName, modelUrl] = model.split("@");
    const modelConfigElement = createModelConfigElement(modelName);
    modelConfigContainer.appendChild(modelConfigElement);
  });
});

// Event listener for the API keys dropdown button
document
  .getElementById("api-keys-dropdown-btn")
  .addEventListener("click", function (event) {
    document.getElementById("api-keys-container").classList.toggle("show");
  });

// Close the API keys dropdown if the user clicks outside of it
window.onclick = function (event) {
  if (!event.target.matches("#api-keys-dropdown-btn")) {
    var apiKeysContainer = document.getElementById("api-keys-container");
    if (apiKeysContainer.classList.contains("show")) {
      apiKeysContainer.classList.remove("show");
    }
  }
};

// Create a static default model config element using the default configuration
const defaultModelConfigElement = createModelConfigElement('default', true);
document
  .getElementById("default-params-container")
  .appendChild(defaultModelConfigElement); // Append to the default params container
