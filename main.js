var dmp = new diff_match_patch();

var nodes = new vis.DataSet([]);
var edges = new vis.DataSet([]);

// Global variable to track if model colors are enabled
// Get the value from the toffle-model-colors checkbox
var useModelColors = document.getElementById("toggle-model-colors").checked;

// Function to update the visualization with new nodes
function updateVisualization(newNodes) {
  // First, find all the hidden children of the new nodes
  console.log(newNodes);
  var hiddenChildren = [];
  newNodes.forEach((node) => {
    if (node.hidden) {
      findDescendentNodes(node.id).forEach((descendant) => {
        hiddenChildren.push(descendant);
      });
    }
  });
  console.log(hiddenChildren);
  newNodes.forEach((node) => {
    if (hiddenChildren.includes(node.id)) {
      return;
    }
    // Use the last patch to set the label, if available
    const lastPatch =
      node.patches && node.patches.length > 0
        ? node.patches[node.patches.length - 1]
        : null;
    var label = lastPatch
      ? formatDiffsForDisplay(lastPatch.diffs)
      : node.text;
    if (node.hidden) {
      label = "...";
    }
    var nodeColor = {
      border: getNodeBorderColor(node.type),
    };
    if (node.hidden) {
      nodeColor.border = "rgba(0, 0, 0, 0.2)";
    }

    nodes.update({
      id: node.id,
      label: label,
      color: nodeColor,
      title: '<div class="info-box">' + (node.bookmarked ? '🌟' : '') + '<strong>Model:</strong> ' + node.type + '</div>',
      parent: node.parent,
    });
    if (node.parent !== null) {
      edges.update({ from: node.parent, to: node.id });
    }
  });

  // Remove the hidden children from the visualization
  nodes.forEach((node) => {
    if (hiddenChildren.includes(node.id)) {
      nodes.remove(node.id);
    }
  });

}

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

// Helper function to check if there are any non-data nodes in the network
function hasNonDataNodes() {
  return (
    nodes.get({
      filter: function (node) {
        return node.group !== "data";
      },
    }).length > 0
  );
}

// Get the context menu element
var contextMenu = document.getElementById('nodeContextMenu');
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

// Function to update the layout direction
function updateLayoutDirection(direction) {
  const options = {
    layout: {
      hierarchical: {
        direction: direction,
      },
    },
  };
  network.setOptions(options);
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
  var descendents = findDescendentNodes(nodeId);
  console.log(nodeId);
  console.log(descendents);
  updateVisualization([node].concat(descendents.map((id) => data.nodes[id])));
  localStorage.setItem("data", JSON.stringify(data));
}

// Function to delete a node and all its descendants
function deleteNode(nodeId) {
  const node = data.nodes[nodeId];
  var descendents = findDescendentNodes(nodeId);
  const nodesToDelete = [nodeId].concat(descendents);
  nodesToDelete.forEach((id) => {
    nodes.remove(id);
    delete data.nodes[id];
  });
  edges.remove(
    edges.get({
      filter: function (edge) {
        return nodesToDelete.includes(edge.from) || nodesToDelete.includes(edge.to);
      },
    }),
  );
  localStorage.setItem("data", JSON.stringify(data));
}

function createNodeIfTextChanged(originalText, newText, parentId, type) {
  if (originalText !== newText || !hasNonDataNodes()) {
    // Text has changed, or it's the first node, create a new node
    const newNodeId = !hasNonDataNodes()
      ? 1
      : Object.keys(data.nodes).length + 1;
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
    useModelColors = event.target.checked;
    updateNodeColors(); // Update only the node colors without re-rendering the entire tree
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
