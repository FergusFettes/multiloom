const modelSanitized = [
  "gemma-7b",
  "mistral-7b-instruct-v0.2",
  "mixtral-8x7b-instruct-v0.1",
  "mixtral-8x7b-v0.1",
  "llama-2-70b",
  "mistral-7b-v0.1",
  "gpt-3.5-turbo",
  "gpt-4-turbo-preview",
]

const remoteName = {
  "gemma-7b": "google/gemma-7b",
  "mistral-7b-instruct-v0.2": "mistralai/Mistral-7B-Instruct-v0.2",
  "mixtral-8x7b-instruct-v0.1": "mistralai/Mixtral-8x7B-Instruct-v0.1",
  "mixtral-8x7b-v0.1": "mistralai/Mixtral-8x7B-v0.1",
  "llama-2-70b": "togethercomputer/llama-2-70b",
  "mistral-7b-v0.1": "mistralai/Mistral-7B-v0.1",
  "gpt-3.5-turbo": "gpt-3.5-turbo",
  "gpt-4-turbo-preview": "gpt-4-turbo-preview",
};

const modelUrl = {
  "gemma-7b": "https://api.together.xyz/v1/completions",
  "mistral-7b-instruct-v0.2": "https://api.together.xyz/v1/completions",
  "mixtral-8x7b-instruct-v0.1": "https://api.together.xyz/v1/completions",
  "mixtral-8x7b-v0.1": "https://api.together.xyz/v1/completions",
  "llama-2-70b": "https://api.together.xyz/v1/completions",
  "mistral-7b-v0.1": "https://api.together.xyz/v1/completions",
  "gpt-3.5-turbo": "https://api.openai.com/v1/chat/completions",
  "gpt-4-turbo-preview": "https://api.openai.com/v1/chat/completions",
}

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

function createModelConfigElement(modelName, isDefault = false) {
  const configSection = document.createElement("div");
  configSection.className = "model-config-blob";
  configSection.id = `model-config-${modelName}`;
  configSection.innerHTML = `
            <h3>${modelName}
            ${isDefault ? "" : `<input type="checkbox" class="model-enable-checkbox" id="enable-${modelName}">`}
            </h3>
            <div class="model-config-fields">
            <label for="max-tokens-input-${modelName}">Max Tokens:</label>
            <input type="number" id="max-tokens-input-${modelName}" value="${modelConfig.max_tokens}" step="10"><br>
            <label for="temperature-input-${modelName}">Temperature:</label>
            <input type="number" step="0.1" id="temperature-input-${modelName}" value="${modelConfig.temperature}"><br>
            <label for="top-p-input-${modelName}">Top P:</label>
            <input type="number" step="0.1" id="top-p-input-${modelName}" value="${modelConfig.top_p}"><br>
            <label for="top-k-input-${modelName}">Top K:</label>
            <input type="number" id="top-k-input-${modelName}" value="${modelConfig.top_k}"><br>
            <label for="repetition-penalty-input-${modelName}">Repetition Penalty:</label>
            <input type="number" step="0.1" id="repetition-penalty-input-${modelName}" value="${modelConfig.repetition_penalty}"><br>
            <label for="stop-sequence-input-${modelName}">Stop Sequence:</label>
            <input type="text" id="stop-sequence-input-${modelName}" value="${modelConfig.stop.join(", ")}"><br>
            <label for="completions-input-${modelName}">Completions:</label>
            <input type="number" id="completions-input-${modelName}" value="${modelConfig.n}"><br>
            ${
              isDefault
                ? ""
                : `<label for="pin-default-${modelName}">Pin to Default:</label>
            <input type="checkbox" id="pin-default-${modelName}" checked>`
            }
        </div>
    `;
  return configSection;
}

window.addEventListener("DOMContentLoaded", function () {
  const modelConfigContainer = document.getElementById(
    "model-params-container",
  );
  modelSanitized.forEach((model) => {
    const modelConfigElement = createModelConfigElement(model);
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
const defaultModelConfigElement = createModelConfigElement("default", true);
document
  .getElementById("default-params-container")
  .appendChild(defaultModelConfigElement); // Append to the default params container
