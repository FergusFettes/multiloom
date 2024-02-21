// On page load, retrieve the API key from localStorage
document.addEventListener("DOMContentLoaded", function () {
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
  const savedApiKey = localStorage.getItem("apiKey");
  if (savedApiKey) {
    const apiKeyInput = document.getElementById("api-key-input");
    apiKeyInput.value = savedApiKey.trim().replace(/^"|"$/g, "");
    apiKey = apiKeyInput.value;
    apiKeyInput.style.backgroundColor = "green";
  }
});

// Initialize data object to store nodes and edges
var data = { nodes: {}, edges: {} };

// Function to clear data from localStorage and reset visualization
function clearData() {
  localStorage.removeItem("data");
  data = { nodes: {}, edges: {} }; // Reset data object
  nodes.clear(); // Clear nodes from DataSet
  edges.clear(); // Clear edges from DataSet
  document.getElementById("background-text").style.display = "flex"; // Show background text
}

function exportJSON() {
  console.log(data);
  const jsonData = JSON.stringify(data, null, 2);
  document.getElementById("json-data-textarea").value = jsonData;
}

// Function to import JSON data from the textarea
function importJSON() {
  const jsonData = document.getElementById("json-data-textarea").value;
  try {
    const parsedData = JSON.parse(jsonData);
    document.getElementById("background-text").style.display = "none";
    // Update the data object and visualization with the new data
    data = parsedData;
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
    "var data = { nodes: {}, edges: {} };",
    "var data = " + JSON.stringify(data) + ";",
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
