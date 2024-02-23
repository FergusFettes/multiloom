// Helper function to update a single node in the visualization
function updateNodeInVisualization(node) {
  const lastPatch =
    node.patches && node.patches.length > 0
      ? node.patches[node.patches.length - 1]
      : null;
  let label = lastPatch ? formatDiffsForDisplay(lastPatch.diffs) : node.text;
  if (node.hidden) {
    label = "...";
  }
  const nodeColor = {
    border: getNodeBorderColor(node.type),
  };
  if (node.hidden) {
    nodeColor.border = "rgba(0, 0, 0, 0.2)";
  }
  nodes.update({
    id: node.id,
    label: label,
    color: nodeColor,
    title:
      '<div class="info-box">' +
      (node.bookmarked ? "🌟" : "") +
      "<strong>Model:</strong> " +
      node.type +
      "</div>",
    parent: node.parent,
  });
  if (node.parent !== null) {
    edges.update({ from: node.parent, to: node.id });
  }
}

// Helper function to find the root node of a subtree given any node in the set
function findRootOfSubtree(node, allNodes) {
  let currentNode = node;
  while (
    currentNode.parent !== null &&
    allNodes.find((n) => n.id === currentNode.parent)
  ) {
    currentNode = allNodes[currentNode.parent];
  }
  return currentNode;
}

// Helper function to process nodes level by level in chunks
function processNodesByLevel(nodesToProcess, chunkSize) {
  // Create a set of all node IDs for quick lookup
  const allNodesSet = new Set(nodesToProcess.map((node) => node.id));
  // Find the root node of the subtree
  const rootNode = findRootOfSubtree(nodesToProcess[0], nodesToProcess);
  let queue = [rootNode]; // Initialize the queue with the root node
  let chunk = [];

  function processNextLevel() {
    let count = 0;
    while (queue.length > 0 && count < chunkSize) {
      const node = queue.shift(); // Dequeue the next node
      chunk.push(node);
      if (node.hidden) {
        continue; // Skip hidden nodes
      }
      const childNodes = findChildNodes(node.id, nodesToProcess);
      queue.push(...childNodes);
      count++;
    }

    // Process the current chunk
    chunk.forEach((node) => {
      updateNodeInVisualization(node); // Process only visible nodes
    });

    // If the total length of new nodes is > 100, fit the view to the network
    if (nodesToProcess.length > 100) {
      network.fit({ animation: true, locked: false });
    }

    if (queue.length > 0) {
      setTimeout(processNextLevel, 0); // Schedule the next level
    }

    // Reset the chunk for the next iteration
    chunk = [];
  }

  processNextLevel(); // Start processing
}

// Modified updateVisualization function to use processNodesByLevel
function updateVisualization(newNodes) {
  if (newNodes.length === 0) {
    return;
  }
  const chunkSize = 20; // Define the chunk size
  // Assuming newNodes contains the root nodes, otherwise find them
  processNodesByLevel(newNodes, chunkSize);
}
