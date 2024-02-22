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

// Function to find the parent node of the current node
function findParentNode(nodeId) {
  const node = nodes.get(nodeId);
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

// Function to find all the descendents of a node
function findDescendentNodes(nodeId) {
  let descendents = [];
  const children = Object.values(data.nodes).filter(
    (n) => n.parent === nodeId,
  );
  if (children.length > 0) {
    descendents = children.map((child) => child.id);
    children.forEach((child) => {
      descendents = descendents.concat(findDescendentNodes(child.id));
    });
  }
  return descendents;
}
