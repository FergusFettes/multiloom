var dmp = new diff_match_patch();

var nodes = new vis.DataSet([]);
var edges = new vis.DataSet([]);

// Global variable to track if model colors are enabled
// Get the value from the toffle-model-colors checkbox
var useModelColors = document.getElementById("toggle-model-colors").checked;

updateVisualization(Object.values(data.nodes));

function getNodeBorderColor(nodeType) {
  if (!useModelColors) {
    return "black"; // Return black when model colors are disabled
  }
  switch (nodeType) {
    case "mistral-instruct":
      return "blue";
    case "mixtral-instruct":
      return "green";
    case "mixtral":
      return "orange";
    case "llama2":
      return "purple";
    case "mistral":
      return "red";
    case "gpt3t":
      return "#afd7af";
    case "gpt4t":
      return "#d7afff";
    default:
      return "black"; // Default border color for unknown types
  }
}

// Function to update node colors based on the model type
function updateNodeColors() {
  nodes.forEach((node) => {
    const nodeColor = {
      border: getNodeBorderColor(data.nodes[node.id].type),
    };
    nodes.update([{ id: node.id, color: nodeColor }]);
  });
}

// Get the context menu element
var contextMenu = document.getElementById("nodeContextMenu");
// Create a network
const container = document.getElementById("mynetwork");

const visData = {
  nodes: nodes,
  edges: edges,
};
const options = {
  layout: {
    hierarchical: {
      sortMethod: "directed",
      direction: "LR",
      levelSeparation: 400,
      nodeSpacing: 250,
    },
  },
  nodes: {
    shape: "box",
    size: 20,
    color: {
      background: "white",
      border: "grey", // Default border color
      highlight: {
        background: "white",
        border: "black",
      },
    },
    font: {
      size: 20,
      multi: true, // Enable multi-line text
    },
    borderWidth: 2,
    widthConstraint: {
      maximum: 250,
    },
  },
  edges: {
    smooth: true,
    arrows: { to: true },
  },
  physics: { enabled: false },
};
const network = new vis.Network(container, visData, options);

// Check if nodes are empty and display background text
if (!hasNonDataNodes()) {
  document.getElementById("background-text").style.display = "flex";
} else {
  document.getElementById("background-text").style.display = "none";
}

// Function to create a new node if the text has changed or if it's the first node
// Function to toggle the bookmark state of a node
function toggleBookmark(nodeId) {
  const node = data.nodes[nodeId];
  node.bookmarked = !node.bookmarked;
  updateVisualization([node]);
  localStorage.setItem("data", JSON.stringify(data));
}

// Function to toggle the visibility of a node and descendants
function toggleVisibility(nodeId) {
  const node = data.nodes[nodeId];
  node.hidden = !node.hidden;
  const descendents = findDescendentNodes(nodeId);
  // If node was unhidden, send it and all descendents to update
  if (!node.hidden) {
    updateVisualization([node].concat(descendents.map((id) => data.nodes[id])));
  } else {
    updateVisualization([node]);

    // If node was hidden, delete all its children
    descendents.forEach((id) => {
      nodes.remove(id);
    });
    edges.remove(
      edges.get({
        filter: function (edge) {
          return (
            descendents.includes(edge.from) || descendents.includes(edge.to)
          );
        },
      }),
    );
  }
  localStorage.setItem("data", JSON.stringify(data));
}

// Function to delete a node and all its descendants
function deleteNode(nodeId) {
  const node = data.nodes[nodeId];
  const parentNodeId = findParentNode(nodeId);
  var descendents = findDescendentNodes(nodeId);
  const nodesToDelete = [nodeId].concat(descendents);
  nodesToDelete.forEach((id) => {
    nodes.remove(id);
    delete data.nodes[id];
  });
  edges.remove(
    edges.get({
      filter: function (edge) {
        return (
          nodesToDelete.includes(edge.from) || nodesToDelete.includes(edge.to)
        );
      },
    }),
  );
  localStorage.setItem("data", JSON.stringify(data));

  // If there are no mode nodes, set the background text to visible
  if (!hasNonDataNodes()) {
    document.getElementById("background-text").style.display = "flex";
    localStorage.removeItem("checkedOutNodeId");
  }

  // Check out the parent node, and set it to selected
  if (parentNodeId) {
    network.selectNodes([parentNodeId]);
    localStorage.setItem("checkedOutNodeId", parentNodeId);
  }
  // And clear the data-node-id attribute
  document.getElementById("fullText").setAttribute("data-node-id", "");
}

function createNodeIfTextChanged(originalText, newText, parentId, type) {
  if (originalText !== newText || !hasNonDataNodes()) {
    // Text has changed, or it's the first node, create a new node
    const newNodeId = uuid.v4();
    const patches = dmp.patch_make(originalText, newText);
    data.nodes[newNodeId] = {
      id: newNodeId,
      text: dmp.patch_toText(patches),
      patches: patches,
      parent: parentId,
      type: type, // Store the type of the node
      bookmarked: false,
      hidden: false,
    };

    // if the parentId was nan, then the new node is the root and we must set the checked out node
    if (isNaN(parentId)) {
      localStorage.setItem("checkedOutNodeId", newNodeId);
    }

    updateVisualization([data.nodes[newNodeId]]);
    // Save data to local storage
    localStorage.setItem("data", JSON.stringify(data));
    if (type === "human") {
      network.selectNodes([newNodeId]);
      localStorage.setItem("checkedOutNodeId", newNodeId);
    }
    // Hide the background text when the first node is created
    document.getElementById("background-text").style.display = "none";
  }
}

// Close the settings modal
document.getElementById("settingsModal").style.display = "none";

const resizeObserver = new ResizeObserver((entries) => {
  for (let entry of entries) {
    const { width, height } = entry.contentRect;
    const size = { width, height };
    // if new size is not 0, save it to local storage
    if (width !== 0 && height !== 0) {
      localStorage.setItem("textEditorSize", JSON.stringify(size));
    }

    // On page
  }
});

const fullText = document.getElementById("fullText");
resizeObserver.observe(fullText);
