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
  if (parentNodeId === null) {
    return { leftSibling: null, rightSibling: null };
  }

  // Get the siblings and sort them. Use createdAt if available, otherwise fallback to UUID.
  const siblings = Object.values(data.nodes)
    .filter((node) => node.parent === parentNodeId && !node.hidden)
    .sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        // Compare by createdAt if both are available
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else {
        // Fallback to string comparison of UUIDs
        return a.id.localeCompare(b.id);
      }
    });

  // Find the index of the current node
  const currentIndex = siblings.findIndex((sibling) => sibling.id === nodeId);

  // Determine the left and right siblings, wrapping around at the ends
  const leftSiblingIndex =
    currentIndex > 0 ? currentIndex - 1 : siblings.length - 1;
  const rightSiblingIndex =
    currentIndex < siblings.length - 1 ? currentIndex + 1 : 0;

  return {
    leftSibling: siblings[leftSiblingIndex].id,
    rightSibling: siblings[rightSiblingIndex].id,
  };
}

function findLastReadOrRandomChildNode(parentNodeId) {
  // Filter out visible child nodes of the provided parent node
  const childNodes = Object.values(data.nodes).filter(
    (node) => !node.hidden && node.parent === parentNodeId,
  );

  console.log("Children");
  console.log(childNodes);

  if (childNodes.length === 0) {
    return null; // Return null if there are no child nodes
  }

  // Find the last read child node
  const lastReadNode = childNodes.reduce((acc, node) => {
    if (!acc || node.lastRead > acc.lastRead) {
      return node;
    }
    return acc;
  }, null);

  if (lastReadNode) {
    return lastReadNode.id; // Return the id of the last read child node
  }

  // If there is no last read child node, pick a random child node
  const randomIndex = Math.floor(Math.random() * childNodes.length);
  return childNodes[randomIndex].id;
}

// Function to find all the descendents of a node
function findDescendentNodes(nodeId) {
  let descendents = [];
  const children = Object.values(data.nodes).filter((n) => n.parent === nodeId);
  if (children.length > 0) {
    descendents = children.map((child) => child.id);
    children.forEach((child) => {
      descendents = descendents.concat(findDescendentNodes(child.id));
    });
  }
  return descendents;
}

function findChildNodes(nodeId, nodes) {
  return Object.values(nodes).filter((node) => node.parent === nodeId);
}

// Function to find all the descendants of a node and their depth
function findDescendentNodesWithDepth(nodeId, depth = 0) {
  let descendantsWithDepth = [];
  const children = Object.values(data.nodes).filter((n) => n.parent === nodeId);
  if (children.length > 0) {
    descendantsWithDepth = children.map((child) => ({
      id: child.id,
      depth: depth + 1,
    }));
    children.forEach((child) => {
      descendantsWithDepth = descendantsWithDepth.concat(
        findDescendentNodesWithDepth(child.id, depth + 1),
      );
    });
  }
  return descendantsWithDepth;
}

// Function to calculate the path stats for the current path
function getPathStats() {
  const checkedOutNodeId = localStorage.getItem("checkedOutNodeId");
  let currentNode = data.nodes[checkedOutNodeId];
  let pathToRoot = [];

  // Traverse up the tree to collect the path to the root
  while (currentNode) {
    pathToRoot.push(currentNode);
    currentNode = data.nodes[currentNode.parent];
  }

  // Count the occurrences of each model in the path
  const modelCounts = pathToRoot.reduce((counts, node) => {
    counts[node.type] = (counts[node.type] || 0) + 1;
    return counts;
  }, {});

  return modelCounts;
}

// Scoring system framework
const scoringAlgorithms = {
  averageDescendants: function (nodes) {
    const typeCounts = {};
    const typeTotals = {};

    Object.values(nodes).forEach((node) => {
      if (!node.hidden) {
        const descendants = findDescendentNodes(node.id);
        const type = node.type;
        typeCounts[type] = (typeCounts[type] || 0) + descendants.length;
        typeTotals[type] = (typeTotals[type] || 0) + 1;
      }
    });

    // Average by type
    const averages = {};
    for (const type in typeCounts) {
      averages[type] =
        typeTotals[type] > 0
          ? (typeCounts[type] / typeTotals[type]).toFixed(2)
          : 0;
    }

    // Sort the averages by value
    return Object.fromEntries(
      Object.entries(averages).sort(([, a], [, b]) => b - a),
    );
    return averages;
  },
  // Scoring algorithm for Normalized Proportion of Peer Descendants (NPPD)
  normalizedProportionOfPeerDescendants: function (nodes) {
    const nppdScores = {};

    Object.values(nodes).forEach((node) => {
      // Find all children of the current node
      const children = Object.values(nodes).filter(
        (child) => child.parent === node.id,
      );
      if (children.length === 0) {
        // If the node has no children, assign a default score of 1
        nppdScores[node.id] = 1;
      } else {
        // Calculate the total number of descendants for each child
        const totalDescendants = children.reduce((acc, child) => {
          const descendantsCount = findDescendentNodes(child.id).length;
          acc[child.id] = descendantsCount;
          return acc;
        }, {});
        // Calculate the total number of descendants across all children
        const sumOfDescendants = Object.values(totalDescendants).reduce(
          (acc, count) => acc + count,
          0,
        );
        // Calculate the NPPD score for each child
        children.forEach((child) => {
          const proportion =
            sumOfDescendants > 0
              ? totalDescendants[child.id] / sumOfDescendants
              : 0;
          const normalizedScore = proportion * children.length;
          nppdScores[child.id] = normalizedScore.toFixed(2);
        });
      }
    });

    // Average by type
    const typeCounts = {};
    const typeTotals = {};
    for (const [nodeId, nppd] of Object.entries(nppdScores)) {
      const type = data.nodes[nodeId].type;
      typeCounts[type] = (typeCounts[type] || 0) + parseFloat(nppd);
      typeTotals[type] = (typeTotals[type] || 0) + 1;
    }

    const averages = {};
    for (const type in typeCounts) {
      averages[type] =
        typeTotals[type] > 0
          ? (typeCounts[type] / typeTotals[type]).toFixed(2)
          : 0;
    }

    // Sort the averages by values
    return Object.fromEntries(
      Object.entries(averages).sort(([, a], [, b]) => b - a),
    );

    return averages;
  },
  discountedCumulativeGain: function (nodes) {
    const dcgScores = {};

    Object.values(nodes).forEach((node) => {
      let dcg = 0;
      const descendantsWithDepth = findDescendentNodesWithDepth(node.id);
      descendantsWithDepth.forEach((descendant) => {
        const relevance =
          data.nodes[descendant.id] && !data.nodes[descendant.id].hidden
            ? 1
            : 0;
        const position = descendant.depth;
        if (position === 1) {
          dcg += relevance; // rel_1
        } else {
          dcg += relevance / Math.log2(position + 1); // rel_i / log_2(i + 1)
        }
      });
      dcgScores[node.id] = dcg.toFixed(2);
    });

    // Average by type
    const typeCounts = {};
    const typeTotals = {};
    for (const [nodeId, dcg] of Object.entries(dcgScores)) {
      const type = data.nodes[nodeId].type;
      typeCounts[type] = (typeCounts[type] || 0) + parseFloat(dcg);
      typeTotals[type] = (typeTotals[type] || 0) + 1;
    }

    const averages = {};
    for (const type in typeCounts) {
      averages[type] =
        typeTotals[type] > 0
          ? (typeCounts[type] / typeTotals[type]).toFixed(2)
          : 0;
    }

    // Sort the averages by values
    return Object.fromEntries(
      Object.entries(averages).sort(([, a], [, b]) => b - a),
    );

    return dcgScores;
  },
};

// Function to update the stats in the info modal
function updatePathStats() {
  const statsContainer = document.getElementById("stats-container");
  const modelCounts = getPathStats();
  let statsHtml = "<ul>";

  // Title: Path Stats
  statsHtml += "<strong>Path Stats</strong>";

  for (const [model, count] of Object.entries(modelCounts)) {
    statsHtml += `<li>${model}: ${count}</li>`;
  }
  statsHtml += "</ul>";

  statsContainer.innerHTML += statsHtml;
}

// Function to calculate and return scores based on the selected algorithm
function calculateScores(algorithmName) {
  const algorithm = scoringAlgorithms[algorithmName];
  if (algorithm) {
    return algorithm(Object.values(data.nodes));
  } else {
    throw new Error(`Scoring algorithm "${algorithmName}" not found.`);
  }
}
