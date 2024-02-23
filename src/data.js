// On page load, retrieve the API key from localStorage
document.addEventListener("DOMContentLoaded", function () {
  // Load the editor size
  const savedSize = JSON.parse(localStorage.getItem("textEditorSize"));
  const textEditor = document.getElementById("textEditor");
  const fullText = document.getElementById("fullText");
  if (savedSize) {
    textEditor.style.display = "block";
    fullText.style.width = `${savedSize.width}px`;
    fullText.style.height = `${savedSize.height}px`;
    textEditor.style.display = "none";
  }

  // Load data from localStorage on page load
  var savedData = localStorage.getItem("data");
  if (savedData) {
    data = JSON.parse(savedData);
    updateVisualization(Object.values(data.nodes));
  }

  // Hide the background text if there are nodes
  if (Object.keys(data.nodes).length > 0) {
    document.getElementById("background-text").style.display = "none";
  }

  var savedApiKey = localStorage.getItem("togetherApiKey");
  if (savedApiKey) {
    const apiKeyInput = document.getElementById("together-api-key-input");
    apiKeyInput.value = savedApiKey.trim().replace(/^"|"$/g, "");
    togetherApiKey = apiKeyInput.value;
    apiKeyInput.style.backgroundColor = "green";
  }
  savedApiKey = localStorage.getItem("openaiApiKey");
  if (savedApiKey) {
    const apiKeyInput = document.getElementById("openai-api-key-input");
    apiKeyInput.value = savedApiKey.trim().replace(/^"|"$/g, "");
    openaiApiKey = apiKeyInput.value;
    apiKeyInput.style.backgroundColor = "green";
  }
});

// Initialize data object to store nodes and edges
var data = { nodes: {} };

// Function to clear data from localStorage and reset visualization
function clearData() {
  localStorage.removeItem("data");
  localStorage.removeItem("checkedOutNodeId");
  data = { nodes: {} }; // Reset data object
  edges.clear(); // Clear edges from DataSet
  nodes.clear(); // Clear nodes from DataSet
  document.getElementById("background-text").style.display = "flex"; // Show background text
}

function exportJSON() {
  const jsonData = JSON.stringify(data, null, 2);
  document.getElementById("json-data-textarea").value = jsonData;
}

// Function to import JSON data from the textarea
function importJSON() {
  const jsonData = document.getElementById("json-data-textarea").value;
  try {
    const parsedData = JSON.parse(jsonData);
    const newNodes = {};
    const idMapping = {};

    // Generate UUIDs for nodes and create a mapping from old IDs to new UUIDs
    Object.values(parsedData.nodes).forEach((node) => {
      const oldId = node.id;
      const newId = uuid.v4();
      node.id = newId;
      idMapping[oldId] = newId;
      newNodes[newId] = node; // Use new UUID as key in the new nodes object
    });

    // Update parent references to use new UUIDs
    Object.values(newNodes).forEach((node) => {
      if (node.parent && idMapping[node.parent]) {
        node.parent = idMapping[node.parent];
      }
    });

    document.getElementById("background-text").style.display = "none";
    clearData();
    data.nodes = newNodes; // Replace old nodes object with new one using UUIDs as keys
    localStorage.setItem("data", JSON.stringify(data));

    document.getElementById("json-data-textarea").value = "";
    document.getElementById("textEditor").style.display = "none";
    document.getElementById("settingsModal").style.display = "none";
    document.getElementById("background-text").style.display = "none";
    updateVisualization(Object.values(data.nodes));
  } catch (error) {
    console.error("Error parsing JSON:", error);
    alert("Invalid JSON data.");
  }
}

// Function to export a full html with the data embedded
function downloadHTML() {
  var htmlContent = document.documentElement.outerHTML;
  htmlContent = htmlContent.replace(
    "var data = { nodes: {} };",
    "var data = { nodes: " + JSON.stringify(data.nodes) + " };",
  );

  var blob = new Blob([htmlContent], { type: "text/html" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = "index.html";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}