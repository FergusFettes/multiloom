// Event listener for the background text to open the modal on the first click
document
  .getElementById("background-text")
  .addEventListener("click", function () {
    if (!hasNonDataNodes()) {
      document.getElementById("background-text").style.display = "none";
      document.getElementById("textEditor").style.display = "block";
      document.getElementById("fullText").value =
        "(Right click to save and the editor!\nEscape to close without saving!)";
    }
  });

network.on("click", function (params) {
  if (params.nodes.length > 0) {
    nodeId = params.nodes[0];
    const textEditor = document.getElementById("textEditor");
    // Check if the text editor is open
    if (textEditor.style.display === "block") {
      const fullText = renderFullTextFromPatches(nodeId);

      // Update the full text in the editor
      const fullTextElement = document.getElementById("fullText");
      fullTextElement.value = fullText;
      // Ensure the text editor scrolls to the bottom after updates
      requestAnimationFrame(() => {
        fullTextElement.scrollTop = fullTextElement.scrollHeight;
      });
      fullTextElement.scrollTop = fullTextElement.scrollHeight;
      fullTextElement.setAttribute("data-node-id", nodeId);

      // Also, make the text editor no longer the active element.
      fullTextElement.blur();
    }

    // Save the last clicked node ID to localStorage
    network.selectNodes([nodeId]);
    localStorage.setItem("checkedOutNodeId", nodeId);
  }
});

// Event listener for node clicks to show full text in a modal
network.on("doubleClick", function (params) {
  if (params.nodes.length > 0) {
    const nodeId = params.nodes[0];
    renderFullText(nodeId);
    document.getElementById("textEditor").style.display = "block";
  }
});

// Helper function to render and open fulltext
function renderFullText(nodeId) {
  const fullText = renderFullTextFromPatches(nodeId);
  const fullTextElement = document.getElementById("fullText");
  fullTextElement.value = fullText;
  // Ensure the text editor scrolls to the bottom after updates
  requestAnimationFrame(() => {
    fullTextElement.scrollTop = fullTextElement.scrollHeight;
  });
  fullTextElement.scrollTop = fullTextElement.scrollHeight;
  fullTextElement.setAttribute("data-node-id", nodeId);
}

// Event listener for the 'e' key to open the editor
window.addEventListener("keydown", function (event) {
  if (event.key === "e" || event.keyCode === 69) {
    const textEditor = document.getElementById("textEditor");
    if (textEditor.style.display === "block") {
      return; // Do nothing if the editor is already open
    }

    document.getElementById("background-text").style.display = "none";

    // Get the selected node
    const selectedNodeId = network.getSelectedNodes()[0];
    if (selectedNodeId) {
      renderFullText(selectedNodeId);
      document.getElementById("textEditor").style.display = "block";
    } else {
      const fullTextElement = document.getElementById("fullText");
      fullTextElement.setAttribute("data-node-id", selectedNodeId);
      document.getElementById("textEditor").style.display = "block";
    }

    // Focus on the full text element
    document.getElementById("fullText").focus();

    // Prevent the default action of the 'e' key
    event.preventDefault();
  }
});

// Modify the event listener for the modal to call createNodeIfTextChanged with human type
window.addEventListener("contextmenu", function (event) {
  const textEditor = document.getElementById("textEditor");
  const fullTextElement = document.getElementById("fullText");
  if (event.target === textEditor || event.target === fullTextElement) {
    // Get the current text from the modal
    const newText = fullTextElement.value;
    var nodeId = parseInt(fullTextElement.getAttribute("data-node-id"));

    console.log("Node ID: ", nodeId);
    // If nodeId is null or NaN
    if (nodeId === null || isNaN(nodeId)) {
      nodeId = localStorage.getItem("checkedOutNodeId");
      console.log("checkedOutNodeId ID: ", nodeId);
    }

    const originalText = renderFullTextFromPatches(nodeId);
    console.log("Original Text: ", originalText);
    console.log("New Text: ", newText);

    // Create a new node if the text has changed with type as 'human'
    createNodeIfTextChanged(originalText, newText, nodeId, "human");

    // Ensure the text editor scrolls to the bottom after updates
    requestAnimationFrame(() => {
      fullTextElement.scrollTop = fullTextElement.scrollHeight;
    });

    // Close the modal
    textEditor.style.display = "none";
    fullTextElement.scrollTop = fullTextElement.scrollHeight;
    event.preventDefault(); // Prevent the default context menu from showing
  }
});

// Event listener for the Escape key to close the modal regardless of focus
window.addEventListener("keydown", function (event) {
  if (
    (event.key === "Escape" || event.keyCode === 27) &&
    document.getElementById("textEditor").style.display === "block"
  ) {
    document.getElementById("textEditor").style.display = "none";
  }

  // If there are no nodes and the text editor is not open, show the background text
  if (
    Object.keys(data.nodes).length === 0 &&
    document.getElementById("textEditor").style.display === "none"
  ) {
    document.getElementById("background-text").style.display = "flex";
  }
});

// Event listener for the 'p' key to open settings
window.addEventListener("keydown", function (event) {
  if (event.key === "p" || event.keyCode === 80) {
    // if the editor is open, do nothing
    if (document.getElementById("textEditor").style.display === "block") {
      return;
    }
    // Toggle the settings modal
    document.getElementById("settingsModal").style.display =
      document.getElementById("settingsModal").style.display === "block"
        ? "none"
        : "block";
  }
});

// Event listener for the r key to generate new output
window.addEventListener("keydown", function (event) {
  if (event.key === "r" || event.keyCode === 82) {
    const fullTextElement = document.getElementById("fullText");
    // Check if the modal is open and focussed
    if (document.activeElement === fullTextElement) {
      return; // Exit the function if the modal is open
    }
    // Retrieve the last clicked node ID from localStorage
    const checkedOutNodeId = localStorage.getItem("checkedOutNodeId");

    if (checkedOutNodeId) {
      // Generate new output based on the checked-out node
      generateNewOutput(checkedOutNodeId);
    }
    event.preventDefault(); // Prevent the default action of the 'r' key
  }
});

// Event listener for the "Download" button
document.getElementById("btn-download").addEventListener("click", downloadHTML);

// Event listener for API key input to change background color
document
  .getElementById("together-api-key-input")
  .addEventListener("input", function (event) {
    const input = event.target;
    togetherApiKey = input.value.trim().replace(/^"|"$/g, "");
    if (togetherApiKey !== "") {
      // Save the API key to localStorage
      localStorage.setItem("togetherApiKey", togetherApiKey);
      input.style.backgroundColor = "green";
    } else {
      input.style.backgroundColor = "pink";
    }
  });

// Event listener for API key input to change background color
document
  .getElementById("openai-api-key-input")
  .addEventListener("input", function (event) {
    const input = event.target;
    openaiApiKey = input.value.trim().replace(/^"|"$/g, "");
    if (openaiApiKey !== "") {
      // Save the API key to localStorage
      localStorage.setItem("openaiApiKey", openaiApiKey);
      input.style.backgroundColor = "green";
    } else {
      input.style.backgroundColor = "pink";
    }
  });

// Event listener for model checkboxes to change model configuration
document.querySelectorAll(".model-checkbox").forEach((checkbox) => {
  checkbox.addEventListener("change", function (event) {
    const selectedModels = Array.from(
      document.querySelectorAll(".model-checkbox:checked"),
    ).map((checkbox) => checkbox.value);
  });
});

// Event listener for the 'Clear Data' button
document.getElementById("clear-data-btn").addEventListener("click", clearData);

// Event listener for the settings button to toggle the settings modal
document.getElementById("btn-settings").addEventListener("click", function () {
  const settingsModal = document.getElementById("settingsModal");
  settingsModal.style.display =
    settingsModal.style.display === "block" ? "none" : "block";
});

// Event listener for the toggle model colors checkbox
document
  .getElementById("toggle-model-colors")
  .addEventListener("change", function (event) {
    useModelColors = event.target.checked;
    updateNodeColors();
  });

// Event listener for the save settings button to update the model configuration
document
  .getElementById("save-settings-btn")
  .addEventListener("click", function () {
    modelConfig.max_tokens = parseInt(
      document.getElementById("max-tokens-input").value,
    );
    modelConfig.temperature = parseFloat(
      document.getElementById("temperature-input").value,
    );
    modelConfig.top_p = parseFloat(
      document.getElementById("top-p-input").value,
    );
    modelConfig.top_k = parseInt(document.getElementById("top-k-input").value);
    modelConfig.repetition_penalty = parseFloat(
      document.getElementById("repetition-penalty-input").value,
    );
    modelConfig.stop = [document.getElementById("stop-sequence-input").value];
    modelConfig.n = parseInt(
      document.getElementById("completions-input").value,
    );
    // Function to export JSON data to the textarea
  });

// Event listener for the export JSON button
document
  .getElementById("export-json-btn")
  .addEventListener("click", exportJSON);

// Event listener for the import JSON button
document
  .getElementById("import-json-btn")
  .addEventListener("click", importJSON);

// Event listener for right-click on the settings modal to close it
document
  .getElementById("settingsModal")
  .addEventListener("contextmenu", function (event) {
    this.style.display = "none";
    event.preventDefault(); // Prevent the default context menu
  });

// Attach context menu to the network
network.on("oncontext", function (params) {
  // Prevent default context menu from appearing
  params.event.preventDefault();
  // Check if the right-clicked element is a node
  const nodeId = this.getNodeAt(params.pointer.DOM);
  if (nodeId) {
    // Store the node ID in the context menu's data attribute
    contextMenu.setAttribute("data-node-id", nodeId);
    // Position the custom context menu at the pointer location
    contextMenu.style.top = params.pointer.DOM.y + "px";
    contextMenu.style.left = params.pointer.DOM.x + "px";
    // Display the custom context menu
    contextMenu.style.display = "block";
  }
});

// Hide the context menu when clicking elsewhere
network.on("click", function () {
  if (contextMenu.style.display === "block") {
    contextMenu.style.display = "none";
  }
});

// Event listeners for context menu actions
document.getElementById("hideNode").addEventListener("click", function () {
  const nodeId = contextMenu.getAttribute("data-node-id");
  if (nodeId) {
    toggleVisibility(Number(nodeId));
  }
  contextMenu.style.display = "none";
});

document.getElementById("bookmarkNode").addEventListener("click", function () {
  const nodeId = contextMenu.getAttribute("data-node-id");
  if (nodeId) {
    toggleBookmark(Number(nodeId));
  }
  contextMenu.style.display = "none";
});

document.getElementById("deleteNode").addEventListener("click", function () {
  const nodeId = contextMenu.getAttribute("data-node-id");
  if (nodeId) {
    deleteNode(Number(nodeId));
  }
  contextMenu.style.display = "none";
});

// Event listener for tab to swtich focus between fullText and network
window.addEventListener("keydown", function (event) {
  // If the tab key is pressed, prevent the default action and focus on the network
  if (event.key === "Tab" || event.keyCode === 9) {
    // Check if textEdit is both open and focussed
    fullTextElement = document.getElementById("fullText");
    networkElement = document.getElementById("mynetwork");
    if (
      document.getElementById("textEditor").style.display === "block" &&
      fullTextElement == document.activeElement
    ) {
      networkElement.focus();
      event.preventDefault();
    } else if (
      document.getElementById("textEditor").style.display === "block" &&
      networkElement == document.activeElement
    ) {
      fullTextElement.focus();
      event.preventDefault();
    }
  }
});

// Event listener for the 'w', 'a', 'd', and 's' keys for navigation
window.addEventListener("keydown", function (event) {
  // Check if textEdit is both open and focussed
  if (document.getElementById("textEditor").style.display === "block" && document.getElementById("fullText") == document.activeElement) {
    return; // Do not navigate if the text editor is open
  }
  const checkedOutNodeId = localStorage.getItem("checkedOutNodeId");
  const selectedNodeId = network.getSelectedNodes()[0];
  let targetNodeId = null;
  switch (event.key) {
    case "w":
      targetNodeId = findParentNode(checkedOutNodeId);
      break;
    case "a":
      targetNodeId = findSiblingNodes(checkedOutNodeId).leftSibling;
      break;
    case "d":
      targetNodeId = findSiblingNodes(checkedOutNodeId).rightSibling;
      break;
    case "s":
      targetNodeId = findLongestTextChildNode(checkedOutNodeId);
      break;
    case " ":
      if (selectedNodeId) {
        toggleVisibility(selectedNodeId);
      }
      break;
    case "Enter":
      if (selectedNodeId) {
        toggleBookmark(selectedNodeId);
      }
      break;
    case "Delete":
      if (selectedNodeId) {
        deleteNode(selectedNodeId);
      }
      break;
    case "?":
      makeStats();
      break;
    default:
      return;
  }
  if ( document.getElementById("textEditor").style.display = "block" && targetNodeId !== null) {
    renderFullText(targetNodeId);
  }
  if (targetNodeId !== null) {
    // instead of focusing on it, just make sure it is highlighted
    network.selectNodes([targetNodeId]);
    localStorage.setItem("checkedOutNodeId", targetNodeId); // Save the new checked-out node ID
  }
});


function makeStats() {
    const statsContainer = document.getElementById("stats-container");

    // Tree stats: total number of nodes
    const totalNodes = Object.keys(data.nodes).length;
    let treeStatsHtml = `<strong>Total Nodes:</strong> ${totalNodes}<br>`;

    statsContainer.innerHTML = treeStatsHtml;

    // Update the path stats
    updatePathStats();

    // Calculate and update average descendants stats
    const averageDescendantsStats = calculateScores("averageDescendants");
    let statsHtml = "<ul><strong>Average Descendants by Node Type:</strong>";

    for (const [type, average] of Object.entries(averageDescendantsStats)) {
      statsHtml += `<li>${type}: ${average}</li>`;
    }
    statsHtml += "</ul>";

    statsContainer.innerHTML += statsHtml;

    // Calculate and update discounted cumulative gain stats
    const dcgStats = calculateScores("discountedCumulativeGain");
    let dcgHtml =
      "<ul><strong>Average Discounted Cumulative Gain by Model:</strong>";

    for (const [nodeId, dcg] of Object.entries(dcgStats)) {
      dcgHtml += `<li>${nodeId}: ${dcg}</li>`;
    }
    dcgHtml += "</ul>";

    statsContainer.innerHTML += dcgHtml;

    // Calculate and update normalized proportion of peer descendants
    const npdStats = calculateScores("normalizedProportionOfPeerDescendants");
    let npdHtml =
      "<ul><strong>Normalized Proportion of Peer Descendants by Model:</strong>";

    for (const [nodeId, npd] of Object.entries(npdStats)) {
      npdHtml += `<li>${nodeId}: ${npd}</li>`;
    }
    npdHtml += "</ul>";

    statsContainer.innerHTML += npdHtml;

    // Toggle the info modal display
    const infoModal = document.getElementById("infoModal");
    const isModalOpen = infoModal.style.display === "block";
    infoModal.style.display = isModalOpen ? "none" : "block";
    event.preventDefault();
};
