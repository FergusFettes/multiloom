const modelSanitized = [
  "gemma-7b",
  "mistral-7b-instruct",
  "mistral-7b",
  "mixtral-8x7b-instruct",
  "mixtral-8x7b",
  "llama-2-70b",
  "mistral-large",
  "gpt-35-turbo",
  "gpt-4-turbo",
  "gemini-pro",
];

const remoteName = {
  "gemma-7b": "google/gemma-7b",
  "mistral-7b-instruct": "mistralai/Mistral-7B-Instruct-v0.2",
  "mistral-7b": "mistralai/Mistral-7B-v0.1",
  "mixtral-8x7b-instruct": "mistralai/Mixtral-8x7B-Instruct-v0.1",
  "mixtral-8x7b": "mistralai/Mixtral-8x7B-v0.1",
  "llama-2-70b": "togethercomputer/llama-2-70b",
  "gpt-35-turbo": "gpt-3.5-turbo",
  "gpt-4-turbo": "gpt-4-turbo-preview",
  "mistral-large": "mistral-large-latest",
  "gemini-pro": "gemini-pro",
};

const modelUrl = {
  "gemma-7b": "https://api.together.xyz/v1/completions",
  "mistral-7b-instruct": "https://api.together.xyz/v1/completions",
  "mistral-7b": "https://api.together.xyz/v1/completions",
  "mixtral-8x7b-instruct": "https://api.together.xyz/v1/completions",
  "mixtral-8x7b": "https://api.together.xyz/v1/completions",
  "llama-2-70b": "https://api.together.xyz/v1/completions",
  "gpt-35-turbo": "https://api.openai.com/v1/chat/completions",
  "gpt-4-turbo": "https://api.openai.com/v1/chat/completions",
  "mistral-large": "https://api.mistral.ai/v1/chat/completions",
  "gemini-pro": "https://generativelanguage.googleapis.com/v1beta/models/",
};

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

function saveModelConfigToLocalStorage(modelName) {
  const config = {
    max_tokens: document.getElementById(`max-tokens-input-${modelName}`).value,
    temperature: document.getElementById(`temperature-input-${modelName}`)
      .value,
    top_p: document.getElementById(`top-p-input-${modelName}`).value,
    top_k: document.getElementById(`top-k-input-${modelName}`).value,
    repetition_penalty: document.getElementById(
      `repetition-penalty-input-${modelName}`,
    ).value,
    stop: document
      .getElementById(`stop-sequence-input-${modelName}`)
      .value.split(", "),
    n: document.getElementById(`completions-input-${modelName}`).value,
    pin_to_default: document.getElementById(`pin-default-${modelName}`)
      ? document.getElementById(`pin-default-${modelName}`).checked
      : false,
    is_active: document.getElementById(`enable-${modelName}`)
      ? document.getElementById(`enable-${modelName}`).checked
      : true,
  };
  // If model name contains 'defualt', dont save to local storage, update the default config
  if (modelName.includes("default")) {
    modelConfig = { ...modelConfig, ...config };
    updateDefaultConfigDisplay();
    return;
  }
  localStorage.setItem(`modelConfig-${modelName}`, JSON.stringify(config));
}

function loadModelConfigFromLocalStorage(modelName) {
  const config = JSON.parse(localStorage.getItem(`modelConfig-${modelName}`));
  if (config) {
    document.getElementById(`max-tokens-input-${modelName}`).value =
      config.max_tokens;
    document.getElementById(`temperature-input-${modelName}`).value =
      config.temperature;
    document.getElementById(`top-p-input-${modelName}`).value = config.top_p;
    document.getElementById(`top-k-input-${modelName}`).value = config.top_k;
    document.getElementById(`repetition-penalty-input-${modelName}`).value =
      config.repetition_penalty;
    document.getElementById(`stop-sequence-input-${modelName}`).value =
      config.stop.join(", ");
    document.getElementById(`completions-input-${modelName}`).value = config.n;
    if (document.getElementById(`pin-default-${modelName}`)) {
      document.getElementById(`pin-default-${modelName}`).checked =
        config.pin_to_default;
    }
    if (document.getElementById(`enable-${modelName}`)) {
      document.getElementById(`enable-${modelName}`).checked = config.is_active;
    }
    toggleConfigVisibility(
      modelName,
      document.getElementById(`model-config-${modelName}`),
    );
    updateDefaultConfigDisplay();
  }
}

function createModelConfigElement(modelName, isDefault = false) {
  const configSection = document.createElement("div");
  configSection.className = "model-config-blob";
  configSection.id = `model-config-${modelName}`;
  configSection.innerHTML = `
            <h3>${modelName}--on:
            ${
              isDefault
                ? ""
                : `<input type="checkbox" class="model-enable-checkbox" id="enable-${modelName}"><label for="pin-default-${modelName}"> use defaults: </label><input type="checkbox" id="pin-default-${modelName}" checked>`
            }
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
            </div>
    `;
  // Attach event listeners to save config on change
  configSection.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", () =>
      saveModelConfigToLocalStorage(modelName),
    );
  });
  toggleConfigVisibility(modelName, configSection);
  return configSection;
}

function toggleConfigVisibility(modelName, configSection) {
  const enableCheckbox = configSection.querySelector(`#enable-${modelName}`);
  const pinnedCheckbox = configSection.querySelector(
    `#pin-default-${modelName}`,
  );
  const pinnedLabel = configSection.querySelector(
    `label[for=pin-default-${modelName}]`,
  );
  const configFields = configSection.querySelector(".model-config-fields");
  if (enableCheckbox) {
    console.log("Adding event listener");
    enableCheckbox.addEventListener("change", () => {
      console.log("triggered event listener");
      configFields.style.display =
        enableCheckbox.checked && !pinnedCheckbox.checked ? "block" : "none";
      pinnedCheckbox.style.display = enableCheckbox.checked ? "inline" : "none";
      pinnedLabel.style.display = enableCheckbox.checked ? "inline" : "none";
    });
    pinnedCheckbox.addEventListener("change", () => {
      console.log("triggered event listener");
      configFields.style.display =
        enableCheckbox.checked && !pinnedCheckbox.checked ? "block" : "none";
    });
    // Set initial visibility based on checkbox state
    configFields.style.display =
      enableCheckbox.checked && !pinnedCheckbox.checked ? "block" : "none";
    pinnedCheckbox.style.display = enableCheckbox.checked ? "inline" : "none";
    pinnedLabel.style.display = enableCheckbox.checked ? "inline" : "none";
  }
}

window.addEventListener("DOMContentLoaded", function () {
  // Event listener for the API keys dropdown button
  document
    .getElementById("api-keys-dropdown-btn")
    .addEventListener("click", function (event) {
      document.getElementById("api-keys-container").classList.toggle("show");
    });

  const modelConfigContainer = document.getElementById(
    "model-params-container",
  );
  modelSanitized.forEach((model) => {
    const modelConfigElement = createModelConfigElement(model);
    modelConfigContainer.appendChild(modelConfigElement);
    // Load model configuration from localStorage
    loadModelConfigFromLocalStorage(model);
  });
  updateDefaultConfigDisplay();
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

function updateDefaultConfigDisplay() {
  const maxTokensDisplay = document.getElementById(
    "default-max-tokens-display",
  );
  const temperatureDisplay = document.getElementById(
    "default-temperature-display",
  );
  if (modelConfig) {
    maxTokensDisplay.textContent = `Max Tokens: ${modelConfig.max_tokens}`;
    const temperature = parseFloat(modelConfig.temperature);
    temperatureDisplay.textContent = `Temperature: ${temperature.toFixed(2)}`;
    const color = interpolateColor(temperature, 0.7, 0.99, {
      from: [76, 175, 80],
      to: [244, 67, 54],
    });
    temperatureDisplay.style.color = `rgb(${color.join(", ")})`;
  }
}

function interpolateColor(value, min, max, colors) {
  const ratio = (value - min) / (max - min);
  return colors.from.map((fromColor, index) => {
    const toColor = colors.to[index];
    return Math.round(fromColor + ratio * (toColor - fromColor));
  });
}

// Create a static default model config element using the default configuration
const defaultModelConfigElement = createModelConfigElement("default", true);
document
  .getElementById("default-params-container")
  .appendChild(defaultModelConfigElement); // Append to the default params container
