

var dmp = new diff_match_patch();

var nodes = new vis.DataSet([]);
var edges = new vis.DataSet([]);

// Global variable to track if model colors are enabled
var useModelColors = true;

function cleanText(text) {
  // Remove everything up to and including the second plus sign in the text
  var plusIndex = text.indexOf("+");
  if (plusIndex >= 0) {
    text = text.substring(plusIndex + 1);
  }
  plusIndex = text.indexOf("+");
  if (plusIndex >= 0) {
    text = text.substring(plusIndex + 1);
  }
  return text;
}

// Function to update the visualization with new nodes
function updateVisualization(newNodes) {
  newNodes.forEach((node) => {
    // Use the last patch to set the label, if available
    const lastPatch =
      node.patches && node.patches.length > 0
        ? node.patches[node.patches.length - 1]
        : null;
    const label = lastPatch
      ? formatDiffsForDisplay(lastPatch.diffs)
      : node.text;
    const nodeColor = {
      border: getNodeBorderColor(node.type),
    };
    nodes.update({
      id: node.id,
      label: label,
      color: nodeColor,
      parent: node.parent,
    });
    if (node.parent !== null) {
      edges.update({ from: node.parent, to: node.id });
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
    default:
      return "black"; // Default border color for unknown types
  }
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

console.log("Processed nodes:", nodes);
console.log("Processed edges:", edges);

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
    };

    // if the parentId was nan, then the new node is the root and we must set the checked out node
    if (isNaN(parentId)) {
      localStorage.setItem("checkedOutNodeId", newNodeId);
      console.log("Checked out node ID:", newNodeId);
    }

    updateVisualization([data.nodes[newNodeId]]);
    // Save data to localStorage
    localStorage.setItem("data", JSON.stringify(data));
    // if type is human, select the new node
    if (type === "human") {
      network.selectNodes([newNodeId]);
      localStorage.setItem("checkedOutNodeId", newNodeId);
    }
    // Hide the background text when the first node is created
    document.getElementById("background-text").style.display = "none";
  }
}

// Function to format diffs for display
function formatDiffsForDisplay(diffs) {
  const deletions = diffs
    .filter((diff) => diff[0] === -1)
    .map((diff) => diff[1])
    .join(" ")
    .trim();
  const additions = diffs
    .filter((diff) => diff[0] === 1)
    .map((diff) => diff[1])
    .join(" ")
    .trim();
  const delStr = deletions ? `-${deletions}` : "";
  const addStr = additions ? `+${additions}` : "";
  return `${delStr} ${addStr}`.trim();
}

// Function to render the full text from patches
function renderFullTextFromPatches(nodeId) {
  let currentNode = data.nodes[nodeId];
  let pathToRoot = [];
  let fullText = "";

  // Traverse up the tree to collect the path to the root
  while (currentNode) {
    pathToRoot.push(currentNode);
    currentNode = data.nodes[currentNode.parent];
  }

  // Reverse the path to start from the root
  pathToRoot.reverse();

  // Apply the patches from the root to the current node
  pathToRoot.forEach((node) => {
    if (node.patches) {
      // Apply the patch to the current full text
      const patches = node.patches;
      const results = dmp.patch_apply(patches, fullText);
      fullText = results[0]; // Update the full text with the applied patch
    }
  });

  return fullText;
}

// Close the settings modal
document.getElementById("settingsModal").style.display = "none";
console.log("Model configuration updated:", modelConfig);

// Function to find the parent node of the current node
function findParentNode(nodeId) {
  const node = nodes.get(nodeId);
  console.log("With parent:", node.parent);
  return node && node.parent ? node.parent : null;
}

// Function to find the left and right sibling nodes of the current node
function findSiblingNodes(nodeId) {
  const parentNodeId = findParentNode(nodeId);
  if (parentNodeId) {
    const siblings = nodes.get({
      filter: function (n) {
        return parseInt(n.parent) === parseInt(parentNodeId);
      },
    });
    const index = siblings.findIndex(
      (sibling) => parseInt(sibling.id) === parseInt(nodeId),
    );
    const leftSibling = index > 0 ? siblings[index - 1].id : null;
    const rightSibling =
      index < siblings.length - 1 ? siblings[index + 1].id : null;
    return { leftSibling, rightSibling };
  }
  return { leftSibling: null, rightSibling: null };
}

// Function to find the child node with the longest text from the currently selected node's children
function findLongestTextChildNode(parentNodeId) {
  let longestNode = null;
  let maxLength = 0;
  nodes.forEach(function (node) {
    if (parseInt(node.parent) === parseInt(parentNodeId)) {
      const length = node.label.length;
      if (length > maxLength) {
        longestNode = node.id;
        maxLength = length;
      }
    }
  });
  return longestNode;
}
