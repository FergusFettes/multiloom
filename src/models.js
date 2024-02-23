const models = [
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

function createModelConfigElement(modelName) {
    const configSection = document.createElement('div');
    configSection.className = 'model-config-blob';
    configSection.id = `model-config-${modelName}`;
    configSection.innerHTML = `
        <h3>${modelName}</h3>
        <div class="model-config-fields">
            <label for="max-tokens-input">Max Tokens:</label>
            <input type="number" id="max-tokens-input" value="${modelConfig.max_tokens}" step="10"><br>
            <label for="temperature-input">Temperature:</label>
            <input type="number" step="0.1" id="temperature-input" value="${modelConfig.temperature}"><br>
            <label for="top-p-input">Top P:</label>
            <input type="number" step="0.1" id="top-p-input" value="${modelConfig.top_p}"><br>
            <label for="top-k-input">Top K:</label>
            <input type="number" id="top-k-input" value="${modelConfig.top_k}"><br>
            <label for="repetition-penalty-input">Repetition Penalty:</label>
            <input type="number" step="0.1" id="repetition-penalty-input" value="${modelConfig.repetition_penalty}"><br>
            <label for="stop-sequence-input">Stop Sequence:</label>
            <input type="text" id="stop-sequence-input" value="${modelConfig.stop.join(', ')}"><br>
            <label for="completions-input">Completions:</label>
            <input type="number" id="completions-input" value="${modelConfig.n}">
        </div>
    `;
    return configSection;
}

function sanitizeModelName(modelName) {
    return modelName.replace(/[^a-zA-Z0-9]/g, '');
}

function populateModelCheckboxes() {
    const modelCheckboxesContainer = document.getElementById('model-checkboxes');

    models.forEach(model => {
        const [modelName, modelUrl] = model.split('@');
        const cleanName = sanitizeModelName(modelName);
        
        // Create checkbox element for each model
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'model-checkbox';
        checkbox.id = `model-checkbox-${cleanName}`;
        checkbox.name = modelName;
        checkbox.value = model;
        checkbox.checked = true; // Default to checked

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = modelName;

        const div = document.createElement('div');
        div.className = 'model-checkbox-container';
        div.appendChild(checkbox); // Append the checkbox to the container
        div.appendChild(label); // Append the label to the container

        modelCheckboxesContainer.appendChild(div); // Append the container to the parent
    });
}

// Call populateModelCheckboxes on window load or document ready
window.addEventListener('DOMContentLoaded', populateModelCheckboxes);


// Event listener for the model dropdown button
document.getElementById('model-dropdown-btn').addEventListener('click', function(event) {
    document.getElementById('model-checkboxes').classList.toggle('show');
});


// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName('dropdown-content');
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
};

// Event listener for the API keys dropdown button
document.getElementById('api-keys-dropdown-btn').addEventListener('click', function(event) {
    document.getElementById('api-keys-container').classList.toggle('show');
});

// Close the API keys dropdown if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('#api-keys-dropdown-btn')) {
        var apiKeysContainer = document.getElementById('api-keys-container');
        if (apiKeysContainer.classList.contains('show')) {
            apiKeysContainer.classList.remove('show');
        }
    }
};

// Create a static default model config element using the default configuration
const defaultModelConfigElement = createModelConfigElement(modelConfig.model);
document.getElementById('default-params-container').appendChild(defaultModelConfigElement); // Append to the default params container

